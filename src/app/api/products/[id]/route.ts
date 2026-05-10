import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { verifySession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { name, category, quantity, price } = body;

    if (
      typeof name !== "string" ||
      typeof category !== "string" ||
      typeof quantity !== "number" ||
      typeof price !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid or missing fields: name(string), category(string), quantity(number), price(number)" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 }
      );
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, category, quantity, price },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const mapped = {
      id: updatedProduct._id.toString(),
      name: updatedProduct.name,
      category: updatedProduct.category,
      quantity: updatedProduct.quantity,
      price: updatedProduct.price,
    };
    return NextResponse.json(mapped);
  } catch (error: unknown) {
    console.error("API Server Error:", error instanceof Error ? error.message : String(error));
    if (error instanceof Error && (error.name === "ValidationError" || error.name === "CastError")) {
      return NextResponse.json(
        { error: "Failed to update product. Ensure all fields are valid." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 }
      );
    }

    const result = await Product.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("API Server Error:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

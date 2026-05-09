import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { verifySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const sort = searchParams.get("sort");
    const order = searchParams.get("order");

    const query: Record<string, any> = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, "i");
      query.$or = [{ name: searchRegex }, { category: searchRegex }];
    }

    if (status === "low-stock") {
      query.quantity = { $lt: 15 };
    } else if (status === "medium-stock") {
      query.quantity = { $gte: 15, $lte: 30 };
    } else if (status === "in-stock") {
      query.quantity = { $gte: 30 };
    }

    let productQuery = Product.find(query);

    const allowedSortFields = ["name", "category", "quantity", "price"];
    const sortField = sort && allowedSortFields.includes(sort) ? sort : undefined;

    if (sortField) {
      const sortOrder = order === "desc" ? -1 : 1;
      productQuery = productQuery.sort({ [sortField]: sortOrder });
    }

    const products = await productQuery.lean();
    const mapped = products.map((p: any) => ({
      id: p._id.toString(),
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      price: p.price,
    }));
    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error("API Server Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { name, category, quantity, price } = body;

    const newProduct = new Product({ name, category, quantity, price });
    const savedProduct = await newProduct.save();
    const mapped = {
      id: (savedProduct as any)._id.toString(),
      name: savedProduct.name,
      category: savedProduct.category,
      quantity: savedProduct.quantity,
      price: savedProduct.price,
    };
    return NextResponse.json(mapped, { status: 201 });
  } catch (error: any) {
    console.error("API Server Error:", error.message);
    if (error?.name === "ValidationError" || error?.name === "CastError") {
      return NextResponse.json(
        { error: "Failed to create product. Ensure all fields are valid." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

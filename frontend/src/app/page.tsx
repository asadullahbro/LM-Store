import { secureFetch } from '@/lib/api';
import AddToCartButton from '@/components/AddToCartButton';

// 1. Fetch products from your FastAPI backend
async function getProducts() {
  try {
    // Note: On the server side, we use the direct URL. 
    // If this fails, make sure your FastAPI is running on port 8000.
    const res = await fetch('http://127.0.0.1:8000/api/products', { 
      cache: 'no-store' 
    });
    
    if (!res.ok) return [];
    return res.json();
  } catch (err) {
    console.error("Backend connection failed:", err);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="space-y-10 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Modern Tech Store
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Built with FastAPI and Next.js. Fast, secure, and ready for action.
        </p>
      </section>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
        {products.length > 0 ? (
          products.map((product: any) => (
            <div key={product.id} className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl p-4 transition-all hover:shadow-lg">
              {/* Image Placeholder */}
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-slate-100 group-hover:opacity-75 flex items-center justify-center text-slate-400">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="object-cover" />
                ) : (
                  <span className="text-sm font-medium">No Image</span>
                )}
              </div>

              {/* Product Details */}
              <div className="mt-4 flex flex-col flex-grow">
                <h3 className="text-sm font-bold text-slate-700">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <p className="text-lg font-extrabold text-blue-600">
                    ${product.price}
                  </p>
                  <p className={`text-xs font-semibold ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                  </p>
                </div>
              </div>

              {/* Client Component Button */}
              <AddToCartButton productId={product.id} />
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 italic">No products found in the database.</p>
          </div>
        )}
      </div>
    </div>
  );
}
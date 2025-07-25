import { useState } from "react";
import { categories } from "@/data/products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  RefreshCw,
  MinusIcon,
  PlusIcon,
  ShoppingCart,
} from "lucide-react";
import { CartItem, Product } from "@/types";
import { cn } from "@/lib/utils";
import { useProductState, useCurrencyState } from "@/store";
import { ProductSkeleton } from "@/components/ui/skeletons/ProductSkeleton";
import { useProductsByCategory } from "@/hooks/use-query-hooks";
import { ScrollArea } from "../ui/scroll-area";
import { useListProducts } from "@/lib/api/products";

interface ProductListProps {
  onAddToCart: (product: CartItem) => void;
}

export function ProductList({ onAddToCart }: ProductListProps) {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } =
    useProductState();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const { data: products = [], isLoading } = useListProducts();

  const handleAddToCart = (product: any, variant: string = "") => {
    const selectedVariant =
      variant || (product.variants?.length > 0 ? product.variants[0].name : "");

    const quantity = quantities[product.id || product.name] || 1;

    const cartItem: CartItem = {
      id: product.id || product.name, // Use name as fallback ID
      name: product.name,
      price: product.variants?.[0]?.price || "0", // Use first variant's price or default
      quantity: quantity,
      variant: selectedVariant,
      image: product.image,
    };

    onAddToCart(cartItem);

    // Reset quantity after adding to cart
    setQuantities({
      ...quantities,
      [product.id || product.name]: 0,
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    const currentQty = quantities[productId] || 0;
    const newQty = Math.max(0, currentQty + delta);

    setQuantities({
      ...quantities,
      [productId]: newQty,
    });
  };

  // Filter products by search query and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || product.category?.name === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from products
  const availableCategories = [
    "All",
    ...new Set(products.map((p) => p.category?.name).filter(Boolean)),
  ];

  return (
    <ScrollArea className="bg-white p-4 rounded-lg shadow-xs border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Product Lists</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[250px] h-9"
            />
          </div>
          <Button variant="outline" className="h-9">
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>Input manually</span>
          </Button>
        </div>
      </div>

      {/* Categories tabs */}
      <Tabs value={selectedCategory} className="mb-6">
        <TabsList className="flex overflow-x-auto space-x-1 pb-1">
          {availableCategories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-foreground"
              )}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Products grid with loading state */}
      {isLoading ? (
        <ProductSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id || product.name}
              className="border rounded-md overflow-hidden"
            >
              <div className="h-48 w-full overflow-hidden bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://placehold.co/400x300/e2e8f0/64748b?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{product.name}</h3>
                  {product.category && (
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: product.category.color || "#e2e8f0",
                      }}
                    >
                      {product.category.name}
                    </span>
                  )}
                </div>

                {product.variants?.length > 0 && (
                  <div className="text-sm text-gray-700 mt-1">
                    {product.variants[0].price}{" "}
                    {/* Show first variant's price by default */}
                  </div>
                )}

                <div className="mt-2 flex flex-wrap gap-1">
                  {product.variants?.map((variant) => (
                    <Button
                      key={variant.name}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2 rounded-sm"
                      onClick={() => handleAddToCart(product, variant.name)}
                    >
                      {variant.name} ({variant.price})
                    </Button>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        updateQuantity(product.id || product.name, -1)
                      }
                    >
                      <MinusIcon className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-6 text-center">
                      {quantities[product.id || product.name] || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() =>
                        updateQuantity(product.id || product.name, 1)
                      }
                    >
                      <PlusIcon className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="h-8 text-xs"
                    disabled={
                      (quantities[product.id || product.name] || 0) === 0
                    }
                  >
                    <ShoppingCart className="mr-1 h-3 w-3" />
                    Add to cart
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}

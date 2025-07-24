import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrencySymbol } from "@/lib/currencyFormatter";
import { useCurrencyState } from "@/store";
import { CurrencyType } from "@/types";
import { Check, ChevronDown } from "lucide-react";

export function GlobalCurrencySelector() {
  const { currency, setCurrency } = useCurrencyState();
  
  const currencies: CurrencyType[] = ["USD", "EUR", "GBP", "JPY", "BTC"];

  const handleSelectCurrency = (selectedCurrency: CurrencyType) => {
    setCurrency(selectedCurrency);
  };

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1">
            <span className="text-lg font-medium">
              {getCurrencySymbol(currency)}
            </span>
            <span className="hidden md:inline">{currency}</span>
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currencies.map((currencyOption) => (
            <DropdownMenuItem
              key={currencyOption}
              onClick={() => handleSelectCurrency(currencyOption)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">
                  {getCurrencySymbol(currencyOption)}
                </span>
                <span>{currencyOption}</span>
              </div>
              {currency === currencyOption && (
                <Check className="h-4 w-4 ml-2" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
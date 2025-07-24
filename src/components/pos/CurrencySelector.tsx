import { CurrencyType } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CurrencySelectorProps {
  currency: CurrencyType;
  setCurrency: (currency: CurrencyType) => void;
}

export function CurrencySelector({ currency, setCurrency }: CurrencySelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Currency:</span>
      <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyType)}>
        <SelectTrigger className="w-[90px] h-9">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="IDR">IDR</SelectItem>
          <SelectItem value="USD">USD</SelectItem>
          <SelectItem value="EUR">EUR</SelectItem>
          <SelectItem value="GBP">GBP</SelectItem>
          <SelectItem value="JPY">JPY</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
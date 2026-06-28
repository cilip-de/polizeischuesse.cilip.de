"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  data: { value: string; label: string }[];
  label: string;
  placeholder?: string;
  searchable?: boolean;
  clearable?: boolean;
}

export function MultiSelect({
  value,
  onChange,
  data,
  label,
  placeholder = "auswählen (mehrfach)",
  clearable = true,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedItems = data.filter((item) => value.includes(item.value));

  const handleSelect = (itemValue: string) => {
    if (value.includes(itemValue)) {
      onChange(value.filter((v) => v !== itemValue));
    } else {
      onChange([...value, itemValue]);
    }
  };

  const handleRemove = (itemValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== itemValue));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            className="w-full justify-between font-normal h-auto min-h-9"
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selectedItems.length > 0 ? (
                selectedItems.map((item) => (
                  <Badge
                    key={item.value}
                    variant="secondary"
                    className="text-xs"
                  >
                    {item.label}
                    {/* Wrapper span needed because the Button applies
                        `[&_svg]:pointer-events-none` to all descendant SVGs,
                        which would otherwise swallow clicks on this icon. */}
                    <span
                      role="button"
                      aria-label={`${item.label} entfernen`}
                      className="pointer-events-auto ml-1 flex items-center cursor-pointer"
                      onClick={(e) => handleRemove(item.value, e)}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-1 ml-2 shrink-0">
              {/* Clear-all only with 2+ selected; a single tag is removed via
                  its own badge icon, so we avoid showing two redundant crosses. */}
              {clearable && value.length > 1 && (
                <span
                  role="button"
                  aria-label={`${label}: Auswahl zurücksetzen`}
                  className="pointer-events-auto flex items-center cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange([]);
                  }}
                >
                  <X className="h-3 w-3 opacity-50 hover:opacity-100" />
                </span>
              )}
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder={`${label} suchen...`} />
            <CommandList>
              <CommandEmpty>Keine Ergebnisse.</CommandEmpty>
              <CommandGroup>
                {data.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.label}
                    onSelect={() => handleSelect(item.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(item.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

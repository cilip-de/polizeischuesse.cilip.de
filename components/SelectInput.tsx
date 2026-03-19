import { SearchableSelect } from "@/components/ui/searchable-select";

interface SelectInputProps {
  skey: string;
  label: string;
  selection: { [key: string]: any };
  data: { value: string; label: string }[];
  onChange: (value: string | null) => void;
}

const SelectInput = ({ skey, label, selection, data, onChange }: SelectInputProps) => {
  if (!data || !Array.isArray(data)) {
    return (
      <SearchableSelect
        value={selection[skey] || ""}
        onChange={onChange}
        label={label}
        placeholder="auswählen"
        clearable
        data={[]}
      />
    );
  }

  const processedData = data.map(({ value, label }) => ({ value, label }));

  return (
    <SearchableSelect
      value={selection[skey] || ""}
      onChange={onChange}
      label={label}
      placeholder="auswählen"
      clearable
      data={processedData}
    />
  );
};

export default SelectInput;

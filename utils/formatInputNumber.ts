export const formatInputNumber = (
  input: string,
  currency: string = "TND"
): string => {
  const trimmed = input.trim();

  // Remove any non-numeric characters except for dots and commas
  const numericInput = trimmed.replace(/[^\d.,-]/g, "");

  if (numericInput === "") {
    return "";
  }

  // Replace commas with dots to handle decimal separator
  const normalizedInput = numericInput.replace(",", ".");

  // const numberFormatter = new Intl.NumberFormat("en-US", {
  //   style: "currency",
  //   currency: currency,
  // });

  // let formatted = numberFormatter.format(Number(normalizedInput));

  // // Remove the currency symbol and any extra spaces
  // formatted = formatted.replace(/[^0-9.,]/g, "").trim();
  return `${normalizedInput}`;
};

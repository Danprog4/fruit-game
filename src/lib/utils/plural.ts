export function pluralizeRuIntl(count: number, forms: Record<string, string>) {
  const pr = new Intl.PluralRules("ru");
  // CLDR categories: one | few | many | other
  const category = pr.select(count);
  // fall back to many if a form isn't provided
  const form = forms[category] || forms.many;
  return `${count} ${form}`;
}

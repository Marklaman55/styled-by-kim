export const formatPhone = (phone: string) => {
  let p = phone.replace(/\D/g, '');

  if (p.startsWith('0')) p = '254' + p.slice(1);
  if (!p.startsWith('254')) p = '254' + p;

  return `whatsapp:+${p}`;
};

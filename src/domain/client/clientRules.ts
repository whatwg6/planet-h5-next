export function hasClientIdentity(client: { id: string }) {
  return client.id.trim().length > 0;
}

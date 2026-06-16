const ch = window.api.profile

export const profileService = {
  get: () => ch.get(),
  upsert: (payload) => ch.upsert(payload)
}

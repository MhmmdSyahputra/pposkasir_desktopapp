import { ipcMain } from 'electron'
import { profileRepo } from '../../db/repositories/profile.repo.js'

export function registerProfileIpc() {
  ipcMain.handle('profile:get', async () => {
    try {
      return profileRepo.getProfile()
    } catch (error) {
      console.error('Error fetching store profile:', error)
      throw error
    }
  })

  ipcMain.handle('profile:upsert', async (_, data) => {
    try {
      return profileRepo.upsertProfile(data)
    } catch (error) {
      console.error('Error upserting store profile:', error)
      throw error
    }
  })
}

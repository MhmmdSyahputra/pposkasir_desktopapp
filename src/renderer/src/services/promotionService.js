class PromotionService {
  async getBanners() {
    try {
      const response = await fetch('https://api.muhammadsyahputra.my.id/api/v1/banner/get')
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()

      if (data && data.status === 200 && Array.isArray(data.result)) {
        // Filter active banners and sort by priority (assuming ascending order, i.e., lower number = higher priority)
        const activeBanners = data.result
          .filter((banner) => banner.is_active)
          .sort((a, b) => a.priority - b.priority)

        return activeBanners
      }
      return []
    } catch (error) {
      console.error('Error fetching promotion banners:', error)
      return []
    }
  }
}

export const promotionService = new PromotionService()

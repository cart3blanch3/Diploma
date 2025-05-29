import api from "./api";

export const favoriteService = {
  async getFavorites(userId: string): Promise<string[]> {
    try {
      const res = await api.get(`/favorites/${userId}`);
      return res.data.map((item: any) => item.productId);
    } catch (e) {
      console.error("Ошибка загрузки избранного", e);
      return [];
    }
  },

  async add(userId: string, productId: string) {
    try {
      await api.post(`/favorites/${userId}/${productId}`);
    } catch (e) {
      console.error("Ошибка добавления в избранное", e);
    }
  },

  async remove(userId: string, productId: string) {
    try {
      await api.delete(`/favorites/${userId}/${productId}`);
    } catch (e) {
      console.error("Ошибка удаления из избранного", e);
    }
  },

  async toggle(
    userId: string,
    currentFavorites: string[],
    productId: string,
    setFavorites: (ids: string[]) => void
  ) {
    if (currentFavorites.includes(productId)) {
      await favoriteService.remove(userId, productId);
      setFavorites(currentFavorites.filter((id) => id !== productId));
    } else {
      await favoriteService.add(userId, productId);
      setFavorites([...currentFavorites, productId]);
    }  
  }
  
};

import { CategoryRepository } from '../repositories/category.repository';

export class CategoryService {
  private categoryRepository = new CategoryRepository();

  async createCategory(userId: string, name: string, color: string) {
    if (!name || !name.trim()) {
      throw new Error('Category name is required');
    }
    return this.categoryRepository.create(userId, name.trim(), color || '#3b82f6');
  }

  async getCategories(userId: string) {
    return this.categoryRepository.findAll(userId);
  }

  async getCategoryById(id: string, userId: string) {
    const category = await this.categoryRepository.findById(id, userId);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async updateCategory(id: string, userId: string, data: { name?: string; color?: string }) {
    const category = await this.categoryRepository.findById(id, userId);
    if (!category) {
      throw new Error('Category not found or permission denied');
    }
    return this.categoryRepository.update(id, userId, data);
  }

  async deleteCategory(id: string, userId: string) {
    const category = await this.categoryRepository.findById(id, userId);
    if (!category) {
      throw new Error('Category not found or permission denied');
    }
    return this.categoryRepository.softDelete(id, userId);
  }
}

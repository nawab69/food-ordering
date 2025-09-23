import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MenuItem, MenuFilters } from '../common/types';
import { MenuFiltersDto } from '../common/dto/menu.dto';

@Injectable()
export class MenuService {
    constructor(private readonly databaseService: DatabaseService) { }

    async getMenuItems(filters?: MenuFiltersDto): Promise<MenuItem[]> {
        let items = await this.databaseService.getMenuItems();

        if (!filters) {
            return items;
        }

        // Apply search filter
        if (filters.q) {
            const query = filters.q.toLowerCase();
            items = items.filter(item =>
                item.name.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (filters.category) {
            items = items.filter(item => item.category === filters.category);
        }

        // Apply vegetarian filter
        if (filters.veg === true) {
            items = items.filter(item =>
                item.tags?.includes('vegetarian') || item.tags?.includes('vegan')
            );
        }

        // Apply price filters
        if (filters.minPrice !== undefined) {
            items = items.filter(item => item.price >= filters.minPrice! * 100); // Convert dollars to cents
        }

        if (filters.maxPrice !== undefined) {
            items = items.filter(item => item.price <= filters.maxPrice! * 100); // Convert dollars to cents
        }

        return items;
    }

    async getMenuItemById(id: string): Promise<MenuItem | null> {
        const item = await this.databaseService.getMenuItemById(id);
        return item || null;
    }

    async createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
        const newItem: MenuItem = {
            ...item,
            id: this.generateId(),
        };
        return this.databaseService.createMenuItem(newItem);
    }

    async updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> {
        return this.databaseService.updateMenuItem(id, updates);
    }

    async deleteMenuItem(id: string): Promise<boolean> {
        return this.databaseService.deleteMenuItem(id);
    }

    private generateId(): string {
        return `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

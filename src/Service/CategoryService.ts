import { AppDataSource } from '../Config/database';
import { Category } from '../Entities/Category';
import { Subcategory } from '../Entities/Subcategory';
import { Products } from '../Entities/Products';
import {Not} from "typeorm";

export class CategoryService {
    private categoryRepository = AppDataSource.getRepository(Category);
    private subcategoryRepository = AppDataSource.getRepository(Subcategory);
    private productRepository = AppDataSource.getRepository(Products);

    // Métodos para Categorías

    async getAllWithSubcategories(): Promise<Category[]> {
        try {
            return await this.categoryRepository.find({
                relations: ['subcategories'],
                where: { discard: false } // Solo categorías no descartadas
            });
        } catch (error) {
            throw new Error(`Error al obtener categorías con subcategorías: ${(error as Error).message}`);
        }
    }

    async createCategory(name: string): Promise<Category> {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('El nombre de la categoría no puede estar vacío');
            }

            const existingCategory = await this.categoryRepository.findOne({ where: { name } });
            if (existingCategory) {
                throw new Error('Ya existe una categoría con ese nombre');
            }

            const category = this.categoryRepository.create({ name });
            return await this.categoryRepository.save(category);
        } catch (error) {
            throw new Error(`Error al crear categoría: ${(error as Error).message}`);
        }
    }

    async updateCategory(categoryId: number, name: string): Promise<Category> {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('El nombre de la categoría no puede estar vacío');
            }

            const category = await this.categoryRepository.findOneBy({ category_id: categoryId });
            if (!category) {
                throw new Error('Categoría no encontrada');
            }

            const existingCategory = await this.categoryRepository.findOne({
                where: { name, category_id: Not(categoryId) }
            });
            if (existingCategory) {
                throw new Error('Ya existe otra categoría con ese nombre');
            }

            category.name = name;
            return await this.categoryRepository.save(category);
        } catch (error) {
            throw new Error(`Error al actualizar categoría: ${(error as Error).message}`);
        }
    }

    async toggleDiscardCategory(categoryId: number): Promise<Category> {
        try {
            const category = await this.categoryRepository.findOne({
                where: { category_id: categoryId },
                relations: ['subcategories']
            });

            if (!category) {
                throw new Error('Categoría no encontrada');
            }

            // Cambiar estado de descarte
            category.discard = !category.discard;

            // Si se descarta la categoría, descartar también sus subcategorías
            if (category.discard && category.subcategories) {
                for (const subcategory of category.subcategories) {
                    subcategory.discard = true;
                    await this.subcategoryRepository.save(subcategory);

                    // Descartar también los productos de esta subcategoría
                    await this.productRepository.update(
                        { subcategory: { subcategory_id: subcategory.subcategory_id } },
                        { discard: true }
                    );
                }
            }

            return await this.categoryRepository.save(category);
        } catch (error) {
            throw new Error(`Error al cambiar estado de descarte: ${(error as Error).message}`);
        }
    }

    // Métodos para Subcategorías

    async createSubcategory(name: string, categoryId: number): Promise<Subcategory> {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('El nombre de la subcategoría no puede estar vacío');
            }

            const category = await this.categoryRepository.findOneBy({ category_id: categoryId });
            if (!category) {
                throw new Error('Categoría no encontrada');
            }

            // Verificar si ya existe una subcategoría con el mismo nombre en esta categoría
            const existingSubcategory = await this.subcategoryRepository.findOne({
                where: { name, category: { category_id: categoryId } }
            });

            if (existingSubcategory) {
                throw new Error('Ya existe una subcategoría con ese nombre en esta categoría');
            }

            const subcategory = this.subcategoryRepository.create({
                name,
                category,
                discard: false
            });

            return await this.subcategoryRepository.save(subcategory);
        } catch (error) {
            throw new Error(`Error al crear subcategoría: ${(error as Error).message}`);
        }
    }

    async updateSubcategory(subcategoryId: number, name: string, categoryId: number): Promise<Subcategory> {
        try {
            if (!name || name.trim().length === 0) {
                throw new Error('El nombre de la subcategoría no puede estar vacío');
            }

            const subcategory = await this.subcategoryRepository.findOne({
                where: { subcategory_id: subcategoryId },
                relations: ['category']
            });

            if (!subcategory) {
                throw new Error('Subcategoría no encontrada');
            }

            // Verificar si ya existe otra subcategoría con el mismo nombre en la categoría
            const existingSubcategory = await this.subcategoryRepository.findOne({
                where: {
                    name,
                    category: { category_id: categoryId },
                    subcategory_id: Not(subcategoryId)
                }
            });

            if (existingSubcategory) {
                throw new Error('Ya existe otra subcategoría con ese nombre en esta categoría');
            }

            // Si cambia la categoría
            if (categoryId && subcategory.category.category_id !== categoryId) {
                const newCategory = await this.categoryRepository.findOneBy({ category_id: categoryId });
                if (!newCategory) {
                    throw new Error('Nueva categoría no encontrada');
                }
                subcategory.category = newCategory;
            }

            subcategory.name = name;
            return await this.subcategoryRepository.save(subcategory);
        } catch (error) {
            throw new Error(`Error al actualizar subcategoría: ${(error as Error).message}`);
        }
    }

    async toggleDiscardSubcategory(subcategoryId: number): Promise<Subcategory> {
        try {
            const subcategory = await this.subcategoryRepository.findOne({
                where: { subcategory_id: subcategoryId },
                relations: ['products']
            });

            if (!subcategory) {
                throw new Error('Subcategoría no encontrada');
            }

            // Cambiar estado de descarte
            subcategory.discard = !subcategory.discard;

            // Si se descarta la subcategoría, descartar también sus productos
            if (subcategory.discard && subcategory.products) {
                await this.productRepository.update(
                    { subcategory: { subcategory_id: subcategoryId } },
                    { discard: true }
                );
            }

            return await this.subcategoryRepository.save(subcategory);
        } catch (error) {
            throw new Error(`Error al cambiar estado de descarte: ${(error as Error).message}`);
        }
    }

    // Métodos adicionales útiles

    async getCategoryById(categoryId: number): Promise<Category> {
        try {
            const category = await this.categoryRepository.findOne({
                where: { category_id: categoryId },
                relations: ['subcategories']
            });

            if (!category) {
                throw new Error('Categoría no encontrada');
            }

            return category;
        } catch (error) {
            throw new Error(`Error al obtener categoría: ${(error as Error).message}`);
        }
    }

    async getSubcategoryById(subcategoryId: number): Promise<Subcategory> {
        try {
            const subcategory = await this.subcategoryRepository.findOne({
                where: { subcategory_id: subcategoryId },
                relations: ['category', 'products']
            });

            if (!subcategory) {
                throw new Error('Subcategoría no encontrada');
            }

            return subcategory;
        } catch (error) {
            throw new Error(`Error al obtener subcategoría: ${(error as Error).message}`);
        }
    }

    async getSubcategoriesByCategory(categoryId: number): Promise<Subcategory[]> {
        try {
            return await this.subcategoryRepository.find({
                where: {
                    category: { category_id: categoryId },
                    discard: false
                },
                order: { name: 'ASC' }
            });
        } catch (error) {
            throw new Error(`Error al obtener subcategorías: ${(error as Error).message}`);
        }
    }
}
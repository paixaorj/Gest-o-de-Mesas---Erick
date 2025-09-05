"use client";

import { useState, useEffect } from 'react';
import { MenuItem, Order, Table, OrderItem, DailySummary, Category } from '@/lib/types';

// Hook para gerenciar categorias
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      setCategories(JSON.parse(saved));
    } else {
      // Categorias padrão
      const defaultCategories: Category[] = [
        { id: '1', name: 'espetos', icon: 'Utensils' },
        { id: '2', name: 'lanches', icon: 'Coffee' },
        { id: '3', name: 'bebidas', icon: 'Wine' },
      ];
      setCategories(defaultCategories);
      localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }
  }, []);

  const addCategory = (name: string, icon: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: name.toLowerCase(),
      icon
    };
    const updated = [...categories, newCategory];
    setCategories(updated);
    localStorage.setItem('categories', JSON.stringify(updated));
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const updated = categories.map(category => 
      category.id === id ? { ...category, ...updates } : category
    );
    setCategories(updated);
    localStorage.setItem('categories', JSON.stringify(updated));
  };

  const deleteCategory = (id: string) => {
    const updated = categories.filter(category => category.id !== id);
    setCategories(updated);
    localStorage.setItem('categories', JSON.stringify(updated));
  };

  return { categories, addCategory, updateCategory, deleteCategory };
}

// Hook para gerenciar itens do menu
export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('menuItems');
    if (saved) {
      setMenuItems(JSON.parse(saved));
    } else {
      // Itens padrão
      const defaultItems: MenuItem[] = [
        { id: '1', name: 'Espeto de Carne', category: 'espetos', price: 8.50 },
        { id: '2', name: 'Espeto de Frango', category: 'espetos', price: 7.00 },
        { id: '3', name: 'X-Burger', category: 'lanches', price: 15.00 },
        { id: '4', name: 'X-Salada', category: 'lanches', price: 18.00 },
        { id: '5', name: 'Coca-Cola', category: 'bebidas', price: 5.00 },
        { id: '6', name: 'Cerveja', category: 'bebidas', price: 6.00 },
      ];
      setMenuItems(defaultItems);
      localStorage.setItem('menuItems', JSON.stringify(defaultItems));
    }
  }, []);

  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    localStorage.setItem('menuItems', JSON.stringify(updated));
  };

  const updateMenuItem = (id: string, updates: Partial<MenuItem>) => {
    const updated = menuItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setMenuItems(updated);
    localStorage.setItem('menuItems', JSON.stringify(updated));
  };

  const deleteMenuItem = (id: string) => {
    const updated = menuItems.filter(item => item.id !== id);
    setMenuItems(updated);
    localStorage.setItem('menuItems', JSON.stringify(updated));
  };

  return { menuItems, addMenuItem, updateMenuItem, deleteMenuItem };
}

// Hook para gerenciar mesas
export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('tables');
    if (saved) {
      setTables(JSON.parse(saved));
    }
  }, []);

  const addTable = () => {
    const newTable: Table = {
      id: Date.now().toString(),
      number: tables.length + 1,
      status: 'available'
    };
    const updated = [...tables, newTable];
    setTables(updated);
    localStorage.setItem('tables', JSON.stringify(updated));
  };

  const updateTableStatus = (id: string, status: Table['status'], orderId?: string) => {
    const updated = tables.map(table => 
      table.id === id ? { ...table, status, currentOrderId: orderId } : table
    );
    setTables(updated);
    localStorage.setItem('tables', JSON.stringify(updated));
  };

  const removeTable = () => {
    if (tables.length > 0) {
      const updated = tables.slice(0, -1);
      setTables(updated);
      localStorage.setItem('tables', JSON.stringify(updated));
    }
  };

  return { tables, addTable, removeTable, updateTableStatus };
}

// Hook para gerenciar pedidos
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('orders');
    if (saved) {
      const parsedOrders = JSON.parse(saved).map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        completedAt: order.completedAt ? new Date(order.completedAt) : undefined
      }));
      setOrders(parsedOrders);
    }
  }, []);

  const createOrder = (tableId: string): string => {
    const newOrder: Order = {
      id: Date.now().toString(),
      tableId,
      items: [],
      status: 'active',
      total: 0,
      createdAt: new Date()
    };
    const updated = [...orders, newOrder];
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
    return newOrder.id;
  };

  const addItemToOrder = (orderId: string, menuItem: MenuItem, quantity: number = 1) => {
    const updated = orders.map(order => {
      if (order.id === orderId) {
        const existingItemIndex = order.items.findIndex(item => item.menuItem.id === menuItem.id);
        let newItems: OrderItem[];
        
        if (existingItemIndex >= 0) {
          newItems = order.items.map((item, index) => 
            index === existingItemIndex 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...order.items, { menuItem, quantity }];
        }
        
        const total = newItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
        return { ...order, items: newItems, total };
      }
      return order;
    });
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const removeItemFromOrder = (orderId: string, menuItemId: string) => {
    const updated = orders.map(order => {
      if (order.id === orderId) {
        const newItems = order.items.filter(item => item.menuItem.id !== menuItemId);
        const total = newItems.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
        return { ...order, items: newItems, total };
      }
      return order;
    });
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], paymentMethod?: Order['paymentMethod']) => {
    const updated = orders.map(order => {
      if (order.id === orderId) {
        const updates: Partial<Order> = { status };
        if (status === 'completed') {
          updates.completedAt = new Date();
          if (paymentMethod) updates.paymentMethod = paymentMethod;
        }
        return { ...order, ...updates };
      }
      return order;
    });
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const getDailySummary = (selectedDate?: string): DailySummary => {
    const targetDate = selectedDate || new Date().toDateString();
    const targetOrders = orders.filter(order => 
      order.status === 'completed' && 
      order.completedAt?.toDateString() === targetDate
    );

    const totalRevenue = targetOrders.reduce((sum, order) => sum + order.total, 0);
    const paymentMethods = targetOrders.reduce((acc, order) => {
      if (order.paymentMethod) {
        acc[order.paymentMethod] += order.total;
      }
      return acc;
    }, { dinheiro: 0, cartao: 0, pix: 0 });

    return {
      date: targetDate,
      totalRevenue,
      completedOrders: targetOrders.length,
      paymentMethods
    };
  };

  const getAvailableDates = (): string[] => {
    const dates = orders
      .filter(order => order.status === 'completed' && order.completedAt)
      .map(order => order.completedAt!.toDateString())
      .filter((date, index, array) => array.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    return dates;
  };

  return { 
    orders, 
    createOrder, 
    addItemToOrder, 
    removeItemFromOrder, 
    updateOrderStatus,
    getDailySummary,
    getAvailableDates
  };
}
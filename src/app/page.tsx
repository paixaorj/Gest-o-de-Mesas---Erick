"use client";

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Minus, 
  Settings, 
  Users, 
  Clock, 
  CheckCircle, 
  DollarSign,
  Edit,
  Trash2,
  Coffee,
  Utensils,
  Wine,
  Calendar,
  Tag
} from 'lucide-react';
import { useTables, useOrders, useMenuItems, useCategories } from '@/hooks/useRestaurant';
import { MenuItem, Order, Category } from '@/lib/types';

export default function RestaurantManager() {
  const { tables, addTable, removeTable, updateTableStatus } = useTables();
  const { orders, createOrder, addItemToOrder, removeItemFromOrder, updateOrderStatus, getDailySummary, getAvailableDates } = useOrders();
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useMenuItems();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories();
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', category: 'espetos', price: 0 });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'dinheiro' | 'cartao' | 'pix'>('dinheiro');
  
  // Estados para gerenciamento de categorias
  const [newCategory, setNewCategory] = useState({ name: '', icon: 'Utensils' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Estado para filtro de data no resumo
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toDateString());
  
  const availableDates = getAvailableDates();
  const dailySummary = getDailySummary(selectedDate);

  const handleOpenOrder = (tableId: string) => {
    const orderId = createOrder(tableId);
    updateTableStatus(tableId, 'occupied', orderId);
    setSelectedTable(tableId);
    const newOrder = orders.find(o => o.id === orderId);
    if (newOrder) setSelectedOrder(newOrder);
  };

  const handleAddItemToOrder = (menuItem: MenuItem) => {
    if (selectedOrder) {
      addItemToOrder(selectedOrder.id, menuItem);
      // Atualizar o pedido selecionado
      const updatedOrder = orders.find(o => o.id === selectedOrder.id);
      if (updatedOrder) setSelectedOrder(updatedOrder);
    }
  };

  const handleCompleteOrder = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, 'completed', paymentMethod);
      updateTableStatus(selectedOrder.tableId, 'available');
      setSelectedOrder(null);
      setSelectedTable(null);
    }
  };

  const handleStandbyOrder = () => {
    if (selectedOrder) {
      updateOrderStatus(selectedOrder.id, 'standby');
      setSelectedOrder(null);
      setSelectedTable(null);
    }
  };

  const handleAddMenuItem = () => {
    if (newMenuItem.name && newMenuItem.price > 0) {
      addMenuItem(newMenuItem);
      setNewMenuItem({ name: '', category: categories[0]?.name || 'espetos', price: 0 });
    }
  };

  const handleUpdateMenuItem = () => {
    if (editingItem) {
      updateMenuItem(editingItem.id, editingItem);
      setEditingItem(null);
    }
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      addCategory(newCategory.name.trim(), newCategory.icon);
      setNewCategory({ name: '', icon: 'Utensils' });
    }
  };

  const handleUpdateCategory = () => {
    if (editingCategory) {
      updateCategory(editingCategory.id, editingCategory);
      setEditingCategory(null);
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categories.find(c => c.id === categoryId);
    if (categoryToDelete) {
      // Verificar se há itens usando esta categoria
      const itemsUsingCategory = menuItems.filter(item => item.category === categoryToDelete.name);
      if (itemsUsingCategory.length > 0) {
        alert(`Não é possível excluir a categoria "${categoryToDelete.name}" pois existem ${itemsUsingCategory.length} itens usando ela.`);
        return;
      }
      deleteCategory(categoryId);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'Coffee': return <Coffee className="w-4 h-4" />;
      case 'Wine': return <Wine className="w-4 h-4" />;
      case 'Tag': return <Tag className="w-4 h-4" />;
      default: return <Utensils className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-600 hover:bg-green-700';
      case 'occupied': return 'bg-red-600 hover:bg-red-700';
      case 'reserved': return 'bg-yellow-600 hover:bg-yellow-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Livre';
      case 'occupied': return 'Ocupada';
      case 'reserved': return 'Reservada';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Gestão de Mesas</h1>
        
        <Tabs defaultValue="tables" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-900">
            <TabsTrigger value="tables" className="data-[state=active]:bg-green-600">
              <Users className="w-4 h-4 mr-2" />
              Mesas
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-blue-600">
              <Clock className="w-4 h-4 mr-2" />
              Pedidos
            </TabsTrigger>
            <TabsTrigger value="summary" className="data-[state=active]:bg-purple-600">
              <DollarSign className="w-4 h-4 mr-2" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-orange-600">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Aba Mesas */}
          <TabsContent value="tables" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Mesas do Restaurante</h2>
              <div className="space-x-2">
                <Button onClick={addTable} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Mesa
                </Button>
                <Button onClick={removeTable} variant="destructive" disabled={tables.length === 0}>
                  <Minus className="w-4 h-4 mr-2" />
                  Remover Mesa
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tables.map((table) => (
                <Card key={table.id} className="bg-gray-900 border-gray-700">
                  <CardContent className="p-4 text-center">
                    <div className="text-lg font-bold mb-2">Mesa {table.number}</div>
                    <Badge className={`mb-3 ${getStatusColor(table.status)}`}>
                      {getStatusText(table.status)}
                    </Badge>
                    <div className="space-y-2">
                      {table.status === 'available' && (
                        <Button 
                          onClick={() => handleOpenOrder(table.id)}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          size="sm"
                        >
                          Abrir Pedido
                        </Button>
                      )}
                      {table.status === 'occupied' && table.currentOrderId && (
                        <Button 
                          onClick={() => {
                            const order = orders.find(o => o.id === table.currentOrderId);
                            if (order) {
                              setSelectedOrder(order);
                              setSelectedTable(table.id);
                            }
                          }}
                          className="w-full bg-yellow-600 hover:bg-yellow-700"
                          size="sm"
                        >
                          Ver Pedido
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Modal do Pedido */}
            {selectedOrder && (
              <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="max-w-4xl bg-gray-900 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle>
                      Pedido - Mesa {tables.find(t => t.id === selectedTable)?.number}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Menu de Itens */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Adicionar Itens</h3>
                      <ScrollArea className="h-96">
                        <div className="space-y-2">
                          {categories.map(category => (
                            <div key={category.id}>
                              <h4 className="font-medium text-green-400 mb-2 capitalize flex items-center">
                                {getCategoryIcon(category.icon)}
                                <span className="ml-2">{category.name}</span>
                              </h4>
                              {menuItems
                                .filter(item => item.category === category.name)
                                .map(item => (
                                  <Button
                                    key={item.id}
                                    onClick={() => handleAddItemToOrder(item)}
                                    variant="outline"
                                    className="w-full justify-between bg-gray-800 border-gray-600 hover:bg-gray-700"
                                  >
                                    <span>{item.name}</span>
                                    <span>R$ {item.price.toFixed(2)}</span>
                                  </Button>
                                ))}
                              <Separator className="my-3 bg-gray-700" />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Itens do Pedido */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Itens do Pedido</h3>
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {selectedOrder.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                              <div>
                                <div className="font-medium">{item.menuItem.name}</div>
                                <div className="text-sm text-gray-400">
                                  {item.quantity}x R$ {item.menuItem.price.toFixed(2)}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold">
                                  R$ {(item.quantity * item.menuItem.price).toFixed(2)}
                                </span>
                                <Button
                                  onClick={() => removeItemFromOrder(selectedOrder.id, item.menuItem.id)}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <Separator className="my-4 bg-gray-700" />
                      
                      <div className="text-xl font-bold mb-4">
                        Total: R$ {selectedOrder.total.toFixed(2)}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label>Forma de Pagamento</Label>
                          <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                            <SelectTrigger className="bg-gray-800 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="cartao">Cartão</SelectItem>
                              <SelectItem value="pix">PIX</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex space-x-2">
                          <Button 
                            onClick={handleStandbyOrder}
                            className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Stand By
                          </Button>
                          <Button 
                            onClick={handleCompleteOrder}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={selectedOrder.items.length === 0}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Finalizar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* Aba Pedidos */}
          <TabsContent value="orders" className="space-y-4">
            <h2 className="text-xl font-semibold">Pedidos em Andamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders
                .filter(order => order.status !== 'completed')
                .map(order => {
                  const table = tables.find(t => t.id === order.tableId);
                  return (
                    <Card key={order.id} className="bg-gray-900 border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                          <span>Mesa {table?.number}</span>
                          <Badge className={order.status === 'active' ? 'bg-blue-600' : 'bg-yellow-600'}>
                            {order.status === 'active' ? 'Ativo' : 'Stand By'}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm">
                              {item.quantity}x {item.menuItem.name}
                            </div>
                          ))}
                        </div>
                        <Separator className="my-3 bg-gray-700" />
                        <div className="flex justify-between items-center">
                          <span className="font-bold">R$ {order.total.toFixed(2)}</span>
                          <Button
                            onClick={() => {
                              setSelectedOrder(order);
                              setSelectedTable(order.tableId);
                            }}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Editar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>

          {/* Aba Resumo */}
          <TabsContent value="summary" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Resumo Financeiro</h2>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value={new Date().toDateString()}>Hoje</SelectItem>
                    {availableDates.map(date => (
                      <SelectItem key={date} value={date}>
                        {formatDate(date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-green-400">Faturamento Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {dailySummary.totalRevenue.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">
                    {selectedDate === new Date().toDateString() ? 'Hoje' : formatDate(selectedDate)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-blue-400">Pedidos Concluídos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dailySummary.completedOrders}</div>
                  <div className="text-sm text-gray-400">
                    {selectedDate === new Date().toDateString() ? 'Hoje' : formatDate(selectedDate)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-purple-400">Dinheiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {dailySummary.paymentMethods.dinheiro.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">
                    {((dailySummary.paymentMethods.dinheiro / dailySummary.totalRevenue) * 100 || 0).toFixed(1)}% do total
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-orange-400">Cartão/PIX</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {(dailySummary.paymentMethods.cartao + dailySummary.paymentMethods.pix).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {(((dailySummary.paymentMethods.cartao + dailySummary.paymentMethods.pix) / dailySummary.totalRevenue) * 100 || 0).toFixed(1)}% do total
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Configurações */}
          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-xl font-semibold">Configurações</h2>
            
            {/* Gerenciar Categorias */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Gerenciar Categorias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adicionar Categoria */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Nome da Categoria</Label>
                    <Input
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                      placeholder="Ex: sobremesas"
                    />
                  </div>
                  <div>
                    <Label>Ícone</Label>
                    <Select 
                      value={newCategory.icon} 
                      onValueChange={(value) => setNewCategory({...newCategory, icon: value})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="Utensils">🍴 Utensils</SelectItem>
                        <SelectItem value="Coffee">☕ Coffee</SelectItem>
                        <SelectItem value="Wine">🍷 Wine</SelectItem>
                        <SelectItem value="Tag">🏷️ Tag</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddCategory} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Lista de Categorias */}
                <div className="space-y-2">
                  <h4 className="font-medium">Categorias Existentes</h4>
                  {categories.map(category => (
                    <div key={category.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <div className="flex items-center">
                        {getCategoryIcon(category.icon)}
                        <span className="ml-2 capitalize">{category.name}</span>
                      </div>
                      <div className="space-x-2">
                        <Button
                          onClick={() => setEditingCategory(category)}
                          size="sm"
                          variant="outline"
                          className="border-gray-600"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteCategory(category.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Adicionar Item */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle>Adicionar Novo Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Nome do Item</Label>
                    <Input
                      value={newMenuItem.name}
                      onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Select 
                      value={newMenuItem.category} 
                      onValueChange={(value) => setNewMenuItem({...newMenuItem, category: value})}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Preço (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({...newMenuItem, price: parseFloat(e.target.value) || 0})}
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddMenuItem} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Itens por Categoria */}
            <div className="space-y-4">
              {categories.map(category => (
                <Card key={category.id} className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="capitalize flex items-center">
                      {getCategoryIcon(category.icon)}
                      <span className="ml-2">{category.name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {menuItems
                        .filter(item => item.category === category.name)
                        .map(item => (
                          <div key={item.id} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-sm text-gray-400">R$ {item.price.toFixed(2)}</div>
                            </div>
                            <div className="space-x-2">
                              <Button
                                onClick={() => setEditingItem(item)}
                                size="sm"
                                variant="outline"
                                className="border-gray-600"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => deleteMenuItem(item.id)}
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Modal de Edição de Categoria */}
            {editingCategory && (
              <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
                <DialogContent className="bg-gray-900 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Editar Categoria</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome</Label>
                      <Input
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label>Ícone</Label>
                      <Select 
                        value={editingCategory.icon} 
                        onValueChange={(value) => setEditingCategory({...editingCategory, icon: value})}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="Utensils">🍴 Utensils</SelectItem>
                          <SelectItem value="Coffee">☕ Coffee</SelectItem>
                          <SelectItem value="Wine">🍷 Wine</SelectItem>
                          <SelectItem value="Tag">🏷️ Tag</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleUpdateCategory} className="w-full bg-blue-600 hover:bg-blue-700">
                      Salvar Alterações
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Modal de Edição de Item */}
            {editingItem && (
              <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
                <DialogContent className="bg-gray-900 text-white border-gray-700">
                  <DialogHeader>
                    <DialogTitle>Editar Item</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nome</Label>
                      <Input
                        value={editingItem.name}
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>
                    <div>
                      <Label>Categoria</Label>
                      <Select 
                        value={editingItem.category} 
                        onValueChange={(value) => setEditingItem({...editingItem, category: value})}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Preço (R$)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                        className="bg-gray-800 border-gray-600"
                      />
                    </div>
                    <Button onClick={handleUpdateMenuItem} className="w-full bg-blue-600 hover:bg-blue-700">
                      Salvar Alterações
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
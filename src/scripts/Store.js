import { API_URL } from "./API";

class Store {
  constructor() {
    this.observers = [];
  }

  // Метод для добавления новых наблюдателей функции, которые вызываются при изменении состояния
  subscribe(observerFunction) {
    this.observers.push(observerFunction);
  }

  // Метод для уведомления всех наблюдателей об изменениях в хранилище
  notifyObservers() {
    this.observers.forEach((observer) => observer());
  }
};

class ProductStore extends Store {

  constructor() {
    super();
    this.products = [];
    this.categories = new Set();
  }

  getProducts() {
    return this.products;
  }

  // Метод для обновления списка продуктов
  setProducts(newProducts) {
    this.products = newProducts;
    this.updateCategories(newProducts);
    this.notifyObservers();
  }

  getCategories() {
    return this.categories;
  }

  updateCategories(products) {
    this.categories.clear();

    products.forEach(product => {
      if (product.categories) {
        product.categories.forEach(category => {
          this.categories.add(category)
        })
      }
    });
    this.notifyObservers();
  }
}

class CartStore extends Store {
  constructor() {
    super();
    this.cart = [];
  }

  async init() {
    await this.registerCart();
    await this.fetchCart();
  }

  async registerCart() {
    try {
      const response = await fetch(`${API_URL}/api/cart/register`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

    } catch (err) {
      console.error(err);
    }
  }

  getCart() {
    return this.cart;
  }

  async fetchCart() {
    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.cart = data;
      this.notifyObservers();

    } catch (err) {
      console.error(err);
    }
  }

  async postCart({id, quantity}) {
    try {
      const response = await fetch(`${API_URL}/api/cart/items`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          "Content-Type": 'application/json'
        },
        body: JSON.stringify({productId: id, quantity}),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.cart = data;
      this.notifyObservers();

    } catch (err) {
      console.error(err);
    }
  }

  async addProductCart(id) {
    await this.postCart({id, quantity: 1});
  }

  clearCart() {
    this.cart = [];
    this.notifyObservers();
  }
}

export const productStore = new ProductStore();
export const cartStore = new CartStore();
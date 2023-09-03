import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  public async update(entity: Order): Promise<void> {
    await OrderModel.update(
      {
        customer_id: entity.customerId,
        total: entity.total(),
      },
      {
        where: {
          id: entity.id,
        }, 
      },
    );

    await Promise.all(entity.items.map(async (item) => {
      await OrderItemModel.update(
        {
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        },
        {
          where: {
            id: item.id,
          }
        }
      );
    }));
  }

  public async find(id: string): Promise<Order> {
    let orderModel;
    try {
      orderModel = await OrderModel.findOne({
        where: { id },
        include: ["items"],
      });
    } catch (error) {
      throw new Error("Order not found");
    }

    const orderItems = orderModel?.items?.map(order => {
      return new OrderItem(
        order.id,
        order.name,
        order.price,
        order.product_id,
        order.quantity,
      );
    })

    
    const order = new Order(id, orderModel.customer_id, orderItems);
    
    return order;
  }

  public async findAll(): Promise<Order[]> {
    const orderModels = await OrderModel.findAll({include: [{ model: OrderItemModel }],});

    const orders = orderModels.map((orderModels) => {
      const orderItems = orderModels.items.map(order => {
        return new OrderItem(
          order.id,
          order.name,
          order.price,
          order.product_id,
          order.quantity,
        );
      });
      const order = new Order(
        orderModels.id,
        orderModels.customer_id,
        orderItems,
      );
      return order;
    });

    return orders;
  }
}

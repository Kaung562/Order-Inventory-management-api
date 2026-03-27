import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  Unique,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "orders" })
@Index("idx_orders_created_at", ["createdAt"])
@Index("idx_orders_status", ["status"])
export class OrderOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 32 })
  status!: string;

  @Column({ name: "total_cents", type: "bigint" })
  totalCents!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;

  @OneToMany(() => OrderItemOrmEntity, (item) => item.order, { cascade: false })
  items!: OrderItemOrmEntity[];
}

@Entity({ name: "order_items" })
@Unique(["order", "productId"])
@Index("idx_order_items_order_id", ["order"])
@Index("idx_order_items_product_id", ["productId"])
export class OrderItemOrmEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: "product_id", type: "int" })
  productId!: number;

  @Column({ type: "int" })
  quantity!: number;

  @Column({ name: "unit_price_cents", type: "bigint" })
  unitPriceCents!: string;

  @ManyToOne(() => OrderOrmEntity, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order!: OrderOrmEntity;

  @RelationId((item: OrderItemOrmEntity) => item.order)
  orderId!: number;
}

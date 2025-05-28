import { Model, DataTypes } from 'sequelize';
import sequelize from '../../models/index';

interface JobAttributes {
  id?: string; // Use string type for UUID
  customerName?: string;
  site?: string;
  carNumber?: string;
  brand?: string;
  element?: string;
  deliveryDate?: Date;
  deliveryTime?: string;
  newDamage?: string;
  photos?: Array<{ id:number; image: string }>;
  tasks?: Array<{ id: string; name: string }>; // Task field with only id and name
  agentId?:string

  status?:'Pending'|'Ongoing'|"Completed"
  agencyId?:number
  uniqueId:string
  customerId?:string
  createdAt?: Date;
}

class Job extends Model<JobAttributes> {
  id!: string;
  customerName!: string;
  site!: string;
  carNumber!: string;
  brand!: string;
  element!: string;
  deliveryDate!: Date;
  deliveryTime!: string;
  newDamage!: string;
  photos!: Array<{ id: number; image: string }>;
  tasks!: Array<{ id: string; name: string }>;
  agentId!:string
  status!:'Pending'|'Ongoing'|'Completed'
  createdAt!: Date;
  agencyId!:number
  uniqueId!:string

  customerId!:string
}

Job.init(
  {
    id: {
      type: DataTypes.UUID, // UUID as primary key
      defaultValue: DataTypes.UUIDV4, // Automatically generate UUID
      allowNull: false,
      primaryKey: true,
    },
    uniqueId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    
    carNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    site: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    brand: {
      type: DataTypes.STRING,
    },
    element: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveryTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    photos: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    tasks: {
      type: DataTypes.JSON, // Store multiple tasks as JSON
      allowNull: true,
      defaultValue: [],
    },
    agentId:{
      type:DataTypes.STRING,
      allowNull:true
    },
    status:{
      type:DataTypes.ENUM('Pending','Ongoing','Completed'),
      defaultValue:"Pending"
    },
    agencyId:{
      type:DataTypes.INTEGER,
      allowNull:true
    },
    newDamage:{
      type:DataTypes.TEXT,
      allowNull:true
    },
    customerId:{
      type:DataTypes.STRING,
      allowNull:true
    },
  },

  {
    sequelize,
    modelName: 'Job',
  }
);


export default Job;

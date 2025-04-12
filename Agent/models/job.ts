import { Model, DataTypes } from 'sequelize';
import sequelize from '../../models/index';

interface JobAttributes {
  id?: string; // Use string type for UUID
  customerName?: string;
  customerId?: string;
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
  status?:'Ongoing'|"Completed"
}

class Job extends Model<JobAttributes> {
  id!: string;
  customerName!: string;
  customerId!: string;
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
  status!:'Ongoing'|'Completed'
  createdAt!: Date;
  

}

Job.init(
  {
    id: {
      type: DataTypes.UUID, // UUID as primary key
      defaultValue: DataTypes.UUIDV4, // Automatically generate UUID
      allowNull: false,
      primaryKey: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customerId: {
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
      type:DataTypes.ENUM('Ongoing','Completed'),
      defaultValue:"Ongoing"
    }
  },
  {
    sequelize,
    modelName: 'Job',
  }
);


export default Job;

// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../models/index';
interface AdminAttributes {
  id?: string; // Use string type for UUID
  fullName?: string;
  image?: string;
  email?:string;
  Location?:string;
    agentId?: string[];
  mobilenumber?:string
  password?:string
  permissions?: string[]; // Store allowed actions
  resetPasswordToken?:string
  resetPasswordExpires?:Date
  language?:string
  role?: string



  
 

}

class Admin extends Model<AdminAttributes> {
    id!: string; // Use string type for UUID
    fullName!: string;
    image!: string;
    email!:string;
    mobilenumber!:string;
    password!:string;
    permissions!: string[]; // Store allowed actions
    resetPasswordToken!:string
    resetPasswordExpires!:Date
    language!:string
    Location!:string;
    agentId!: string[];
    role!:string



   

}

Admin.init(
  {
   
    id: {
        type: DataTypes.UUID, // Change this to UUID
        defaultValue: DataTypes.UUIDV4, // Automatically generate UUID
        allowNull: false,
        primaryKey: true,
      },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fullName:{
        type:DataTypes.STRING,
        allowNull:true
      },
      mobilenumber:{
        type:DataTypes.STRING,
        allowNull:true

      },
      password:{
        type:DataTypes.STRING,
        allowNull:true 
      },
      email:{
        type:DataTypes.STRING
      },

      resetPasswordExpires:{
        type:DataTypes.DATE,
        allowNull:true

      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      language:{
        type:DataTypes.STRING,
        defaultValue:'en'

      },
      Location:{
        type:DataTypes.STRING,
        allowNull:true
      },
      role:{
      type:DataTypes.STRING,
      defaultValue:'Admin'
    },

  },
  {
    sequelize,
    modelName: 'Admin',
  }
);


export default Admin;

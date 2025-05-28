// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../models/index';
interface AgencyAttributes {
  id?: number; // Use string type for UUID
  Name?: string;
  image?: string;
  Location?:string;
  agentId?: string[]; // ✅ Change from `JSON` to `string[]`
  email?:string
  password?:string
  resetPasswordToken?:string
  resetPasswordExpires?:Date
  mobilenumber?:string
  createdAt?: Date;

  
 

}

class Agency extends Model<AgencyAttributes> {
    id!: number; // Use string type for UUID
    Name!: string;
    image!: string;
    Location!:string;
    agentId!: string[]; // ✅ Change from `JSON` to `string[]`
    email!:string
    password!:string
    resetPasswordToken!:string
    resetPasswordExpires!:Date
    mobilenumber!:string
   



   

}

Agency.init(
  {
   
    id: {
        type: DataTypes.INTEGER, // Change this to UUID
        allowNull: false,
        primaryKey: true,
        autoIncrement:true
      },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Name:{
        type:DataTypes.STRING,
        allowNull:true
      },
      Location:{
        type:DataTypes.STRING,
        allowNull:true

      },
      agentId:{
        type:DataTypes.JSON,
        allowNull:true
      },

      password:{
        type:DataTypes.STRING,
        allowNull:true 
      },
      email:{
        type:DataTypes.STRING,
        allowNull:true 
      },
      mobilenumber:{
        type:DataTypes.STRING,
        allowNull:true 
      },
      resetPasswordToken:{  
        type:DataTypes.STRING,
        allowNull:true 
      },
      resetPasswordExpires:{
        type:DataTypes.DATE,
        allowNull:true 
      },  
 
      // Agencies

      // Add other attributes as needed
    
    
  },
  {
    sequelize,
    modelName: 'Agency',
  }
);


export default Agency;

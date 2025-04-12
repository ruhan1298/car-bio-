// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../models/index';
interface AgentAttributes {
  agentId?: string; // Use string type for UUID
  fullName?: string;
  image?: string;
  email?:string;
  mobilenumber?:string
  password?:string
  
  resetPasswordToken?:string
  resetPasswordExpires?:Date


  
 

}

class Agent extends Model<AgentAttributes> {
    agentId!: string; // Use string type for UUID
    fullName!: string;
    image!: string;
    email!:string;
    mobilenumber!:string;
    password!:string;
    resetPasswordToken!:string
    resetPasswordExpires!:Date



   

}

Agent.init(
  {
   
    agentId: {
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
      }

  },
  {
    sequelize,
    modelName: 'Agent',
  }
);


export default Agent;

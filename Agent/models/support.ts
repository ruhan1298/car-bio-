// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../models/index';
import { bool } from 'aws-sdk/clients/signer';

// import AddCarsPost from '../models/AddCarsPost';

interface SupportAttributes {
  id?: number; // Use string type for UUID
//   name?: string;
//   email?:string;
agentId?:string
  subject?:string;
  comment?:string
  isReply?:boolean




  
 

}

class Support extends Model<SupportAttributes> {
    id!: number; // Use string type for UUID
    // name!: string;
    // email!:string;
    agentId!:string
    subject!:string
    comment!:string
    isReply!:boolean
   

}

Support.init(
  {
   
    id: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
    
        allowNull: false,
        primaryKey: true,
      },
//     name: {
//         type: DataTypes.STRING,
//         allowNull: true,
//       },
//       email:{
//         type:DataTypes.STRING,
// allowNull:true
//       },
      subject:{
        type:DataTypes.STRING,
        allowNull:true
      },
      comment:{
        type:DataTypes.TEXT,
        allowNull:true
      },
      isReply:{
        type:DataTypes.BOOLEAN,
        defaultValue:false

      },
      agentId:{  
        type:DataTypes.STRING,
        allowNull:true
      },
//       isReply:{  
    
 
  

  },
  {
    sequelize,
    modelName: 'Support',
  }
);
// Review.belongsTo(Admin, { foreignKey: 'reviewerId', as: 'reviewer' });

export default Support;

// models/ShowRoomUser.ts
import { Model, DataTypes } from 'sequelize';
import sequelize from '../../models/index';
import Admin from './auth'
// import AddCarsPost from '../models/AddCarsPost';

interface TermsAttributes {
  id?: number; // Use string type for UUID
  text?: string;


  
 

}

class Terms extends Model<TermsAttributes> {
    id!: number; // Use string type for UUID
    text!: string;



   

}

Terms.init(
  {
   
    id: {
        type: DataTypes.INTEGER,
        autoIncrement:true,
    
        allowNull: false,
        primaryKey: true,
      },
    text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    
  
  

  },
  {
    sequelize,
    modelName: 'Termsandcondition',
  }
);
// Review.belongsTo(Admin, { foreignKey: 'reviewerId', as: 'reviewer' });

export default Terms;

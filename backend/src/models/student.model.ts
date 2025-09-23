import mongoose, { Schema } from 'mongoose';

// Isso nos ajuda com o AutoComplete e checagem de tipos no código
interface IStudent {
  studentId: string;
  name: string;
  address: {
    zipcode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  courses: string[];
}

// Isso diz ao MongoDB como os dados devem ser estruturados e validados
const studentSchema = new Schema<IStudent>(
  {
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    address: {
      zipcode: { type: String, required: true },
      street: { type: String, required: true },
      neighborhood: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
    },
    courses: [
      { type: String },
    ],
  },
  {
    // Adiciona automaticamente os campos: createdAt e updatedAt
    timestamps: true,
  }
);

export const Student = mongoose.model<IStudent>('Student', studentSchema);
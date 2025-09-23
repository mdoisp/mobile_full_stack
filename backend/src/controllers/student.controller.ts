import type { Request, Response } from 'express';
import { Student } from '../models/student.model.js';

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { studentId, name, address, courses } = req.body;

    const newStudent = new Student({
      studentId,
      name,
      address,
      courses,
    });
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating student', error: error });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
    try {
      // Passar {} como argumento significa "sem filtro", traga todos.
      const students = await Student.find({});
      res.status(200).json(students);
    } catch (error) {
      res.status(500).json({ message: 'Error finding student', error: error });
    }
};

export const updateStudent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { studentId, name, address, courses } = req.body;
      const updatedStudent = await Student.findByIdAndUpdate(
        //Usamos o Modelo para 'encontrar pelo ID e atualizar'
        id,
        { studentId, name, address, courses },
        { new: true, runValidators: true }
        // 'new: true' diz ao Mongoose para retornar o documento *depois* da atualização
        // 'runValidators: true' faz ele rodar as regras do Schema (como 'required')
      );
  
      if (!updatedStudent) {
        return res.status(404).json({ message: 'Student not found' });
      }
  
      res.status(200).json(updatedStudent);
  
    } catch (error) {
      res.status(500).json({ message: 'Error updating student', error: error });
    }
};

export const deleteStudent = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const deleteStudent = await Student.findByIdAndDelete(id);

        if (!deleteStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.status(200).json({ message: 'Succefully deleting student' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting student', error: error });
    }
}

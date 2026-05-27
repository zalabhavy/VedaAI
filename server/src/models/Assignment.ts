import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionType {
  type: string;
  numberOfQuestions: number;
  marks: number;
}

export interface IQuestion {
  questionNumber: number;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
  type: string;
  options?: string[];
  answer?: string;
}

export interface ISection {
  title: string;
  instruction: string;
  questionType: string;
  marksPerQuestion: number;
  questions: IQuestion[];
}

export interface IGeneratedPaper {
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  generalInstructions: string;
  sections: ISection[];
  answerKey: { questionNumber: number; answer: string }[];
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  questionTypes: IQuestionType[];
  additionalInfo: string;
  uploadedFileUrl?: string;
  uploadedFileText?: string;
  totalQuestions: number;
  totalMarks: number;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  generatedPaper?: IGeneratedPaper;
  jobId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const questionTypeSchema = new Schema<IQuestionType>({
  type: { type: String, required: true },
  numberOfQuestions: { type: Number, required: true, min: 1 },
  marks: { type: Number, required: true, min: 1 },
});

const questionSchema = new Schema<IQuestion>({
  questionNumber: Number,
  text: String,
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'] },
  marks: Number,
  type: String,
  options: [String],
  answer: String,
});

const sectionSchema = new Schema<ISection>({
  title: String,
  instruction: String,
  questionType: String,
  marksPerQuestion: Number,
  questions: [questionSchema],
});

const generatedPaperSchema = new Schema<IGeneratedPaper>({
  schoolName: String,
  subject: String,
  className: String,
  timeAllowed: String,
  maxMarks: Number,
  generalInstructions: String,
  sections: [sectionSchema],
  answerKey: [{ questionNumber: Number, answer: String }],
});

const assignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    subject: { type: String, default: '' },
    className: { type: String, default: '' },
    dueDate: { type: String, required: true },
    questionTypes: { type: [questionTypeSchema], required: true },
    additionalInfo: { type: String, default: '' },
    uploadedFileUrl: String,
    uploadedFileText: String,
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'processing', 'completed', 'failed'],
      default: 'draft',
    },
    generatedPaper: generatedPaperSchema,
    jobId: String,
  },
  { timestamps: true }
);

export default mongoose.model<IAssignment>('Assignment', assignmentSchema);

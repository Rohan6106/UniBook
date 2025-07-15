import * as yup from 'yup';

const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export const bookSchema = yup.object().shape({
  title: yup.string().trim().min(3, 'Title must be at least 3 characters').required('Title is required'),
  author: yup.string().trim().min(3, 'Author must be at least 3 characters').required('Author is required'),
  mrp: yup.number().typeError('MRP must be a number').positive('MRP must be positive').required('MRP is required'),
  askingPrice: yup
    .number()
    .typeError('Price must be a number')
    .positive('Price must be positive')
    .required('Asking price is required')
    .lessThan(yup.ref('mrp'), 'Asking price cannot be less than or equal to MRP'),
  age: yup.string().required('Book age is required'),
  condition: yup.string().required('Book condition is required'),
  category: yup.string().required('Category is required'),
  description: yup.string().trim().min(20, 'Description must be at least 20 characters').required('Description is required'),
  location: yup.string().trim().required('Location is required'),
  
  // This now validates an array of File objects, not a FileList.
  images: yup
    .array()
    .of(
      yup.mixed<File>()
        .test('fileSize', 'A file is too large (max 2MB)', (value) => 
          !value || (value instanceof File && value.size <= MAX_FILE_SIZE_BYTES)
        )
        .test('fileType', 'Unsupported file format', (value) => 
          !value || (value instanceof File && SUPPORTED_FORMATS.includes(value.type))
        )
    )
    .min(1, 'Please upload at least one image.')
    .max(5, 'You can upload a maximum of 5 images.')
    .required('Please upload at least one image.'),
});

// The generated type will now correctly be `{ images: File[] }`
export type BookFormData = yup.InferType<typeof bookSchema>;
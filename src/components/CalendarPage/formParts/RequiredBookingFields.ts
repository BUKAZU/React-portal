import { BookingFieldsType } from './form_types';

const RequiredBookingFields: BookingFieldsType = [
  {
    id: 'first_name',
    label: 'Voornaam',
    type: 'text',
    options: ['text'],
    required: true,
    placeholder: ''
  },
  {
    id: 'last_name',
    label: 'Achternaam',
    type: 'text',
    options: ['text'],
    required: true,
    mandatory: true,
    placeholder: ''
  },
  {
    id: 'address',
    label: 'Adres',
    type: 'text',
    options: ['text'],
    required: true,
    placeholder: ''
  },
  {
    id: 'house_number',
    label: 'Huisnummer',
    type: 'text',
    options: ['text'],
    required: true,
    placeholder: ''
  },
  {
    id: 'zipcode',
    label: 'Postcode',
    type: 'text',
    options: ['text'],
    required: true,
    placeholder: ''
  },
  {
    id: 'city',
    label: 'Plaats',
    type: 'text',
    options: ['text'],
    required: true,
    placeholder: ''
  },
  {
    id: 'country',
    label: 'Land',
    type: 'select',
    options: ['select'],
    required: true,
    mandatory: true,
    placeholder: ''
  },
  {
    id: 'email',
    label: 'E-mail',
    type: 'email',
    options: ['email'],
    required: true,
    mandatory: true,
    placeholder: ''
  },
  {
    id: 'phone',
    label: 'Telefoonnummer',
    type: 'text',
    options: ['text'],
    required: true,
    placeholder: ''
  }
];

export default RequiredBookingFields;

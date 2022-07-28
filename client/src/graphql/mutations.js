import { gql } from '@apollo/client';

export const LOGIN_USER = gql`
    mutation login($email: String!, $password: String!) {
        login(email: $email, password: $password ) {
            token,
            user {
                username
            }
        }
    }
`

export const CREATE_NEW_PATIENT = gql`
    mutation CreateNewPatient($firstName: String!, $lastName: String!, $dob: String!, $mobileNumber: String, $email: String!, $hasMedicare: Boolean!, $medicareRef: String, $medicareExp: String) {
  createNewPatient(first_name: $firstName, last_name: $lastName, dob: $dob, mobile_number: $mobileNumber, email: $email, has_medicare: $hasMedicare, medicare_ref: $medicareRef, medicare_exp: $medicareExp) {
    _id
    first_name
    last_name
    date_created
    created_by {
      _id
      username
    }
  }
}
`

export const CREATE_NEW_BOOKING = gql`
   mutation CreateNewBooking($bookingDate: String!, $bookingStart: String!, $bookingEnd: String!, $onPatientId: ID!, $bookingType: String!) {
  createNewBooking(booking_date: $bookingDate, booking_start: $bookingStart, booking_end: $bookingEnd, on_patient_id: $onPatientId, booking_type: $bookingType) {
    _id
    first_name
    last_name
    bookings {
      _id
      booking_date
    }
  }
}
`

export const CREATE_NEW_PATIENT_AND_BOOKING = gql`
    mutation CreateNewPatientAndBooking($firstName: String!, $lastName: String!, $dob: String!, $email: String!, $hasMedicare: Boolean!, $bookingDate: String!, $bookingStart: String!, $bookingEnd: String!, $bookingType: String!) {
    createNewPatientAndBooking(first_name: $firstName, last_name: $lastName, dob: $dob, email: $email, has_medicare: $hasMedicare, booking_date: $bookingDate, booking_start: $bookingStart, booking_end: $bookingEnd, booking_type: $bookingType) {
        _id
        date
        open_time
        closing_time
        optom_break_start
        optom_break_end
        bookings {
        _id
        booking_date
        booking_start
        booking_end
        patient {
            _id
            first_name
            last_name
            dob
            mobile_number
            email
        }
        booking_note
        booking_type
        date_created
        }
    }
}`
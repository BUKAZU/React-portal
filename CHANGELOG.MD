# CHANGELOG

## 3.1.12
- New translations for booking button

## 3.1.6
- Set a new default persons if house is less than 2
- Allow persons to be zero if house max is zero

## 3.1.0
- Added review page
- Updated general styling of cards

## 3.0.28
- Pagination update css

## 3.0.27
- Updated styling of form items

## 3.0.26
- Added translations for tents

## 3.0.0
- Refactored app to typescript


## 2.1.11
- Fix weekview on mobile
- Make date bigger on mobile

## 2.1.4
- Store filters in localStorage

## 2.1.3
- Fix issue with regions and city selects

## 2.1.2
- Update react-intl
- Show actual prices for searched period instead of min_weekprice

## 2.1.0
- Ad reviews page
- Show review score on house in search results

## 2.0.12

- Fix bug in required extra_booking field
## 2.0.11

- Fix translations messed up by new version apollo/client

## 2.0.7

- Remove react-apollo as is it deprecated and use @apollo/client
- Fix bug in update of prices per person
## 2.0.1

- Validate age for insurance
- Validate country for insurance
- Add house_number as possible field
- Discount_code can be activated and entered
- Calculation of price is done externally
- Minimum nights message

## 1.3.5

- Detailed error messages added for better understanding what went wrong.
- Check for correct integration of Portal into website
- Mobile styling issues
## 1.3.4

- Backup language for if no language is set
## 1.3.3

- Add error message if no house is found in calendar mode

## 1.3.2

- FIX: Not useable as React Component
## 1.3.0

- Removed styled-components from project
- Reconfigured webpack build and development
- Added cypress for testing
## 1.2.70

- Check field type for optional booking fields and set correct field component
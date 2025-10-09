/**
 * @jest-environment jsdom
 */

import ObjectDetails from '../Object';
import { FormatIntl, Parse_EN_US, LONG_DATE_FORMAT } from '../../../../_lib/date_helper';

// Mock the useLocale function
const mockFormatMessage = jest.fn(({ id }) => `translated_${id}`);
const mockUseLocale = jest.fn(() => ({
    formatMessage: mockFormatMessage
}));


// Mock the intl module
jest.mock('../../../../intl', () => ({
    useLocale: () => mockUseLocale()
}));

describe('ObjectDetails', () => {
    let objectDetails: ObjectDetails;
    const mockHouse = {
        name: 'Test House',
        house_type: 'test_house',
        image_url: 'https://example.com/house.jpg'
    };

    const mockValues = {
        arrivalDate: {
            date: '2025-06-15',
            arrival_time_from: '14:00',
            arrival_time_to: '18:00'
        },
        departureDate: {
            date: '2025-06-20',
            departure_time: '10:00'
        }
    };

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Create a new instance for each test
        objectDetails = new ObjectDetails(mockHouse as any, mockValues as any);
    });

    it('should render the component with correct structure', () => {
        // Act
        const element = objectDetails.render();

        // Assert
        expect(element.tagName).toBe('DIV');

        // Check heading
        const heading = element.querySelector('h2');
        expect(heading).not.toBeNull();
        expect(heading?.textContent).toBe('translated_booking_details');

        // Check house details
        const houseDetails = element.querySelector('.house-details');
        expect(houseDetails).not.toBeNull();

        // Check house name
        const nameElement = houseDetails?.querySelector('div:first-child');
        expect(nameElement?.textContent).toBe('Test House');

        // Check house image
        const img = houseDetails?.querySelector('img');
        expect(img).not.toBeNull();
        expect(img?.src).toBe('https://example.com/house.jpg');

        // Check table structure
        const table = houseDetails?.querySelector('table');
        expect(table).not.toBeNull();

        // Check arrival row
        const arrivalRow = table?.querySelector('tr:first-child');
        expect(arrivalRow).not.toBeNull();

        const arrivalCells = arrivalRow?.querySelectorAll('td');
        expect(arrivalCells?.length).toBe(2);
        expect(arrivalCells?.[0].className).toBe('price');
        expect(arrivalCells?.[0].textContent).toBe(FormatIntl(Parse_EN_US(mockValues.arrivalDate.date), LONG_DATE_FORMAT));
        expect(arrivalCells?.[1].textContent).toBe('14:00 - 18:00');

        // Check departure row
        const departureRow = table?.querySelector('tr:last-child');
        expect(departureRow).not.toBeNull();

        const departureCells = departureRow?.querySelectorAll('td');
        expect(departureCells?.length).toBe(2);
        expect(departureCells?.[0].className).toBe('price');
        expect(departureCells?.[0].textContent).toBe(FormatIntl(Parse_EN_US(mockValues.departureDate.date), LONG_DATE_FORMAT));
        expect(departureCells?.[1].textContent).toBe('10:00');
    });

    it('should call formatMessage with correct translation keys', () => {
        // Act
        objectDetails.render();

        // Assert
        expect(mockFormatMessage).toHaveBeenCalledWith({ id: 'booking_details' });
        expect(mockFormatMessage).toHaveBeenCalledWith({ id: 'test_house.arrival' });
        expect(mockFormatMessage).toHaveBeenCalledWith({ id: 'test_house.departure' });
    });

    it('should handle missing image URL', () => {
        // Arrange
        const houseWithoutImage = { ...mockHouse, image_url: undefined };
        const detailsWithoutImage = new ObjectDetails(houseWithoutImage as any, mockValues as any);

        // Act
        const element = detailsWithoutImage.render();

        // Assert
        const img = element.querySelector('img');
        expect(img).toBeNull();
    });
});

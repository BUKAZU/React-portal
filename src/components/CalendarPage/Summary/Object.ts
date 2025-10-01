import { FormatIntl, LONG_DATE_FORMAT, Parse_EN_US } from '../../../_lib/date_helper';
import { HouseType } from '../../../types';
import { PossibleValues } from '../formParts/form_types';
import { useLocale } from '../../../intl';

export default class ObjectDetails {
    private house: HouseType;
    private values: PossibleValues;
    private t: ReturnType<typeof useLocale>;

    constructor(house: HouseType, values: PossibleValues) {
        this.house = house;
        this.values = values;
        this.t = useLocale();
    }

    public render(): HTMLElement {
        const { arrivalDate, departureDate } = this.values;

        const fragment = document.createDocumentFragment();

        // Create heading
        const heading = document.createElement('h2');
        heading.textContent = this.t.formatMessage({ id: 'booking_details' });
        fragment.appendChild(heading);

        // Create house details container
        const houseDetails = document.createElement('div');
        houseDetails.className = 'house-details';

        // Add house name
        const nameElement = document.createElement('div');
        nameElement.textContent = this.house.name;
        houseDetails.appendChild(nameElement);

        // Add house image
        if (this.house.image_url) {
            const img = document.createElement('img');
            img.src = this.house.image_url;
            img.alt = '';
            houseDetails.appendChild(img);
        }

        // Create table
        const table = document.createElement('table');
        const tbody = document.createElement('tbody');

        // Arrival row
        const arrivalRow = document.createElement('tr');

        const arrivalLabel = document.createElement('th');
        arrivalLabel.textContent = this.t.formatMessage({
            id: `${this.house.house_type}.arrival`
        });

        const arrivalDateCell = document.createElement('td');
        arrivalDateCell.className = 'price';
        arrivalDateCell.textContent = FormatIntl(
            Parse_EN_US(arrivalDate.date),
            LONG_DATE_FORMAT
        );

        const arrivalTimeCell = document.createElement('td');
        arrivalTimeCell.textContent = `${arrivalDate.arrival_time_from} - ${arrivalDate.arrival_time_to}`;

        arrivalRow.append(arrivalLabel, arrivalDateCell, arrivalTimeCell);

        // Departure row
        const departureRow = document.createElement('tr');

        const departureLabel = document.createElement('th');
        departureLabel.textContent = this.t.formatMessage({
            id: `${this.house.house_type}.departure`
        });

        const departureDateCell = document.createElement('td');
        departureDateCell.className = 'price';
        departureDateCell.textContent = FormatIntl(
            Parse_EN_US(departureDate.date),
            LONG_DATE_FORMAT
        );

        const departureTimeCell = document.createElement('td');
        departureTimeCell.textContent = departureDate.departure_time;

        departureRow.append(departureLabel, departureDateCell, departureTimeCell);

        // Assemble table
        tbody.append(arrivalRow, departureRow);
        table.appendChild(tbody);
        houseDetails.appendChild(table);
        fragment.appendChild(houseDetails);

        // Create container and append all elements
        const container = document.createElement('div');
        container.appendChild(fragment);

        return container;
    }
}

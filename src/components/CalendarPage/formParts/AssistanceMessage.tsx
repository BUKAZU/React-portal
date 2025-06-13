import { HouseType } from '../../../types';
import {
  FormatIntl,
  LONG_DATE_FORMAT,
  Parse_EN_US
} from '../../../_lib/date_helper';
import Component from '../../../store/component';
import store from '../../../store';

class AssistanceMessage extends Component {
  private element: HTMLElement;
  private props: { house: HouseType };

  constructor(props: { house: HouseType }) {
    super({
      store,
      element: document.createElement('div')
    });

    this.element.className = 'assistance';
    this.props = props;
  }

  // Method to get i18n message (replace with your i18n solution)
  private getMessage(key: string, values?: Record<string, any>): string {
    // This is a placeholder - replace with your actual i18n implementation
    const messages: Record<string, string> = {
      // Add your messages here or import them from your i18n setup
    };

    let message = messages[`${this.props.house.house_type}.${key}`] || key;

    if (values) {
      Object.entries(values).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, String(value));
      });
    }

    return message;
  }

  public render(): HTMLElement {
    const { departureDate, arrivalDate } = store.state.bookingState;

    // Clear existing content
    this.element.innerHTML = '';

    if (departureDate?.date) {
      const arrivalDateStr = FormatIntl(
        Parse_EN_US(arrivalDate.date),
        LONG_DATE_FORMAT
      );
      const departureDateStr = FormatIntl(
        Parse_EN_US(departureDate.date),
        LONG_DATE_FORMAT
      );

      this.element.innerHTML = `
        ${this.getMessage('you_picked_arrival_date')}: ${arrivalDateStr}<br>
        ${this.getMessage('you_picked_departure_date')}: ${departureDateStr}
      `;

      return this.element;
    }

    if (arrivalDate?.date) {
      const arrivalDateStr = FormatIntl(
        Parse_EN_US(arrivalDate.date),
        LONG_DATE_FORMAT
      );

      this.element.innerHTML = `
        ${this.getMessage('you_picked_arrival_date')}: ${arrivalDateStr}<br>
        ${this.getMessage('pick_your_departure_in_the_calendar')}<br>
        ${this.getMessage('minimum_nights', {
          minimum: arrivalDate.min_nights
        })}
      `;
      return this.element;
    }

    this.element.textContent = this.getMessage(
      'pick_your_arrivaldate_in_the_calendar'
    );
    return this.element;
  }
}

export default AssistanceMessage;

import React from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Loading from "../icons/loading.svg";
import format from "../../_lib/format";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { createPeronsArray } from "./formParts/BookingHelpers";

const dateFormat = "dddd DD MMMM YYYY";

export const CALENDAR_QUERY = gql`
  query BookingPriceQuery(
    $id: ID!
    $house_id: String!
    $starts_at: Date!
    $ends_at: Date!
    $persons: Int
  ) {
    PortalSite(id: $id) {
      houses(house_code: $house_id) {
        id
        name
        booking_price(
          starts_at: $starts_at
          ends_at: $ends_at
          persons: $persons
        )
      }
    }
  }
`;

class PriceField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      persons: 2
    };
  }
  render() {
    const {
      portalCode,
      objectCode,
      startsAt,
      endsAt,
      locale,
      house
    } = this.props;
    const { persons } = this.state;

    let adults = createPeronsArray(house.persons);

    return (
      <div className="calendar--picker">
        <div className="calendar--picker--date">
          <span className="name">
            <FormattedMessage id={`${house.house_type}.arrival`} />
          </span>
          <span className="detail">
            {startsAt ? (
              <span>{format(startsAt, dateFormat)}</span>
            ) : (
              <FormattedMessage
                id={`${house.house_type}.pick_your_arrivaldate_in_the_calendar`}
              />
            )}
          </span>
        </div>
        <div className="calendar--picker--date">
          <span className="name">
            <FormattedMessage id={`${house.house_type}.departure`} />
          </span>
          <span className="detail">
            {endsAt ? (
              <span>{format(endsAt, dateFormat)}</span>
            ) : (
              <FormattedMessage
                id={`${house.house_type}.pick_your_departure_in_the_calendar`}
              />
            )}
          </span>
        </div>
        <div className="calendar--picker--date">
          <span className="detail">
            <select className="calendar--picker--persons" value={persons}>
              {adults.map(person => (
                <FormattedMessage
                  id="persons"
                  children={text => (
                    <option value={person}>
                      {person} {text}
                    </option>
                  )}
                />
              ))}
            </select>
          </span>
        </div>
        {startsAt && endsAt && (
          <Query
            query={CALENDAR_QUERY}
            variables={{
              id: portalCode,
              house_id: objectCode,
              starts_at: startsAt,
              ends_at: endsAt,
              locale: locale
            }}
          >
            {({ loading, data, error }) => {
              if (loading)
                return (
                  <div className="price-overview--build">
                    <Loading />
                  </div>
                );
              if (error)
                return <div className="price-overview--build">Error</div>;
              const result = data.PortalSite.houses[0].booking_price;
              return (
                <React.Fragment>
                  {/* <div className="price-overview--build">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <FormattedMessage id="included_in_price" />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="column" colSpan="2">
                            <FormattedMessage id="rent_price" />
                          </td>
                        </tr>
                        <tr className={result.discount > 0 ? "" : "hidden"}>
                          <td className="column" colSpan="2">
                            <FormattedMessage id="discount" />
                          </td>
                          <td className="price">{result.discount} %</td>
                        </tr>
                        <tr className={result.discount > 0 ? "" : "hidden"}>
                          <td className="column" colSpan="2">
                            <FormattedMessage id="price_after_discount" />
                          </td>
                        </tr>
                        <tr>
                          <td className="column">
                            <ul>
                              {result.required_house_costs.map(cost => {
                                return <li key={cost.id}>{cost.name}</li>;
                              })}
                            </ul>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div> */}

                  <div className="price-overview--book">
                    <div className="price">
                      €{" "}
                      <FormattedNumber
                        value={result.total_price}
                        minimumFractionDigits={2}
                        maximumFractionDigits={2}
                      />
                    </div>
                    <div>
                      <i>
                        <FormattedMessage id="based_on_one_person" value={persons} />
                      </i>
                    </div>
                  </div>
                </React.Fragment>
              );
            }}
          </Query>
        )}
        <button
          className="button"
          onClick={() => {
            this.props.onStartBooking("false");
          }}
        >
          <FormattedMessage id="calculate" />
        </button>
      </div>
    );
  }
}

PriceField.propTypes = {
  portalCode: PropTypes.string.isRequired,
  objectCode: PropTypes.string.isRequired,
  startsAt: PropTypes.string,
  endsAt: PropTypes.string,
  onStartBooking: PropTypes.func.isRequired,
  locale: PropTypes.string.isRequired
};

export default PriceField;

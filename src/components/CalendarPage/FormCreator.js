import React from "react";
import PropTypes from "prop-types";
import { Formik, Form, Field } from "formik";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { Mutation } from "react-apollo";
import { CREATE_BOOKING_MUTATION } from "../../_lib/queries";
import * as calc from "../../_lib/costs";
import { Insurances } from "./formParts/insurances";
import Discount from "./formParts/discount";
import { Summary } from "./formParts/summary";
import { RadioButton, RadioButtonGroup } from "./formParts/radioButtons";
import Icon from "../icons/info.svg";
import Modal from "./formParts/Modal";
import DefaultBookingFields from "./formParts/DefaultBookingFields";
import SuccessMessage from "./formParts/SuccessMessage";
import { OptionalBookingFields } from "./formParts/OptionalBookingFields";
import Description from "./Summary/Description";
import includes from "array-includes";

class FormCreator extends React.Component {
  state = {
    max_persons: this.props.house.persons,
    adults: 1,
    rentPrice: this.props.house.booking_price.rent_price,
    discountedPrice: this.props.house.booking_price.discounted_price,
    formValues: {},
    formSubmit: false,
    bookingFields: this.props.options.bookingFields || DefaultBookingFields
  };

  createPeronsArray(persons) {
    return Array.apply(null, { length: persons + 1 }).map(Number.call, Number);
  }

  validate = values => {
    const { babies_extra } = this.props.house;
    let errors = {};

    let babies = Number(values.babies) - Number(babies_extra);
    if (babies < 0) {
      babies = 0;
    }
    values.persons = Number(values.children) + Number(values.adults) + babies;

    for (let field of this.state.bookingFields) {
      if (field.required) {
        if (!values[field.id]) {
          errors[field.id] = <FormattedMessage id="required" />;
        }
      }
    }

    if (values.adults < 1) {
      errors.adults = <FormattedMessage id="at_least_1_adult" />;
    }
    if (Number(values.discount) > 0 && !values.discount_reason) {
      errors.discount_reason = (
        <FormattedMessage id="you_need_to_give_reason" />
      );
    }
    if (values.persons > this.state.max_persons) {
      errors.max_persons = <FormattedMessage id="max_persons_reached" />;
    }

    return errors;
  };

  calculateCost(cost, values) {
    const bookingPrice = this.props.house.booking_price;
    const { babies_extra } = this.props.house;
    const { children, adults, babies } = values;
    let babiesNumber = Number(babies) - babies_extra;
    if (babiesNumber < 0) {
      babiesNumber = 0;
    }
    
    const persons = Number(children) + Number(adults) + Number(babies);

    return calc[cost.method](
      cost.amount,
      Number(values.costs[cost.id]),
      Number(persons),
      bookingPrice.nights,
      this.calculateRentPrice(values).discounted_price
    );
  }

  calculateInsurances(values) {
    const house = this.props.house;
    const prices = this.calculateRentPrice(values);
    const {
      damage_insurance,
      cancel_insurance,
      travel_insurance,
      children,
      adults,
      babies
    } = values;
    let babiesNumber = Number(babies) - Number(house.babies_extra);
    if (babiesNumber < 0) {
      babiesNumber = 0;
    }
    const persons = Number(children) + Number(adults) + Number(babies);

    let insurances = [];
    if (house.damage_insurance_required || damage_insurance === "1") {
      let ins = {};
      ins.name = "damage_insurance";
      ins.price = prices.discounted_price * (1.81 / 100);
      insurances.push(ins);
    }
    if (cancel_insurance === "1" || cancel_insurance === "2") {
      let perc = cancel_insurance === "1" ? 6.7 : 8.6;
      let ins = {};
      ins.name = "cancel_insurance";
      ins.price = prices.discounted_price * (perc / 100);
      insurances.push(ins);
    }
    if (travel_insurance === "1") {
      let ins = {};
      ins.name = "travel_insurance";
      ins.price = persons * (house.booking_price.nights + 1) * 2.8;
      insurances.push(ins);
    }
    if (
      house.damage_insurance_required ||
      values.damage_insurance === "1" ||
      values.cancel_insurance === "1" ||
      values.cancel_insurance === "2" ||
      values.travel_insurance === "1"
    ) {
      let ins = {};
      ins.name = "insurance_costs";
      ins.price = 6.95;
      insurances.push(ins);
    }
    return insurances;
  }

  translatedOption(id, value) {
    return (
      <FormattedMessage id={id}>
        {formattedMessage => <option value={value}>{formattedMessage}</option>}
      </FormattedMessage>
    );
  }

  calculateRentPrice(values) {
    const {
      base_price,
      person_percentages,
      night_percentages,
      nights
    } = this.props.house.booking_price;
    let discount = this.props.house.booking_price.discount;
    const { children, adults, babies } = values;

    let babiesNumber = Number(babies) - Number(this.props.house.babies_extra);
    if (babiesNumber < 0) {
      babiesNumber = 0;
    }
    const persons = Number(children) + Number(adults) + Number(babiesNumber);
    let night_percentage = night_percentages.find(x => x.nights === nights);
    let night_price = base_price * (night_percentage.percentage / 100);

    let percentage = {
      persons: 5000
      // percentage: 100
    };

    for (let perc of person_percentages) {
      if (persons <= perc.persons && perc.persons < percentage.persons) {
        percentage = perc;
      }
    }

    let price = night_price * (percentage.percentage / 100);

    if (Number(values.discount) > 0 && Number(values.discount) > discount) {
      discount = values.discount;
    }

    let new_rent = {
      rent_price: price,
      discount,
      discounted_price: price - price * (discount / 100)
    };

    return new_rent;
  }

  calculateTotal(values) {
    const bookingPrice = this.props.house.booking_price;
    let total = 0;
    total += this.calculateRentPrice(values).discounted_price;

    for (let ins of this.calculateInsurances(values)) {
      total += ins.price;
    }

    for (let cost of bookingPrice.required_house_costs) {
      total += parseFloat(this.calculateCost(cost, values));
    }
    for (let cost of bookingPrice.optional_house_costs) {
      total += parseFloat(this.calculateCost(cost, values));
    }

    return total;
  }

  render() {
    let adults = this.createPeronsArray(this.state.max_persons);
    const children = this.createPeronsArray(this.state.max_persons - 1);
    const { house, locale, PortalSite, options, booking } = this.props;
    const bookingPrice = house.booking_price;

    let costs = {};
    adults.splice(0, 1);

    for (const val of bookingPrice.optional_house_costs) {
      costs[val.id] = "0";
    }

    return (
      <Mutation mutation={CREATE_BOOKING_MUTATION}>
        {(createBooking, { loading, error, data }) => (
          <Formik
            validate={this.validate}
            initialValues={{
              ...this.props.booking,
              costs,
              adults: booking.persons,
              children: 0,
              babies: 0,
              persons: 2,
              discount: 0,
              country: "nl"
            }}
            onSubmit={(values, { setSubmitting }) => {
              let variables = {
                first_name: values.first_name,
                preposition: values.preposition,
                last_name: values.last_name,
                company_name: values.company_name,
                is_option: JSON.parse(values.is_option),
                address: values.address || "",
                zipcode: values.zipcode || "",
                city: values.city || "",
                phone: values.phone || "",
                phone_mobile: values.phone_mobile || "",
                email: values.email,
                house_code: values.objectCode,
                portal_code: values.portalCode,
                comment: values.comment || "",
                language: locale,
                locale: locale,
                country: values.country.toUpperCase(),
                adults: Number(values.adults),
                children: Number(values.children) || 0,
                babies: Number(values.babies) || 0,
                discount: Number(values.discount) || 0,
                damage_insurance: Number(values.damage_insurance) || 0,
                cancel_insurance: Number(values.cancel_insurance) || 0,
                travel_insurance: Number(values.travel_insurance) || 0,
                discount_reason: values.discount_reason || "",
                arrival_date: values.arrivalDate.date,
                departure_date: values.departureDate.date,
                costs: JSON.stringify(values.costs)
              };
              createBooking({ variables });

              if (
                options.bookingForm &&
                options.bookingForm.redirectUrl &&
                options.bookingForm.redirectUrl !== ""
              ) {
                window.location = options.bookingForm.redirectUrl;
              } else {
                setTimeout(() => {
                  this.props.onReturn();
                }, 5000);
              }
            }}
            render={({ errors, touched, values, status, isSubmitting }) => (
              <Form className="form">
                {loading && <div className="return-message">Loading...</div>}
                {error && (
                  <Modal show={true}>
                    <FormattedMessage id="something_went_wrong_please_try_again" />
                  </Modal>
                )}
                {data && (
                  <Modal show={true}>
                    <SuccessMessage />
                  </Modal>
                )}

                <div className="form-content">
                  <div className="form-section">
                    <a
                      className="return-link"
                      role="link"
                      tabIndex={0}
                      onKeyPress={() => {
                        this.props.onReturn();
                      }}
                      onClick={() => {
                        this.props.onReturn();
                      }}
                    >
                      <FormattedMessage id="return_to_calendar" />
                    </a>
                    <h2>
                      <FormattedMessage id="stay_details" />
                    </h2>
                    <div className="form-row inline">
                      <label htmlFor="adults">
                        <FormattedMessage id="adults" />
                      </label>
                      <Field component="select" name="adults">
                        {adults.map(opt => {
                          return (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          );
                        })}
                      </Field>
                      <div className="age-description">
                        <FormattedMessage
                          id="adults_from"
                          defaultMessage="> {age}"
                          values={{
                            age: options.bookingForm
                              ? options.bookingForm.adults_from || "18"
                              : "18"
                          }}
                        />
                      </div>
                      {errors.adults && touched.adults && (
                        <div className="error-message">{errors.adults}</div>
                      )}
                    </div>
                    {options.bookingForm &&
                    !options.bookingForm.children ? null : (
                      <div className="form-row inline">
                        <label htmlFor="children">
                          <FormattedMessage id="children" />
                        </label>
                        <Field component="select" name="children">
                          {children.map(opt => {
                            return (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            );
                          })}
                        </Field>
                        <div className="age-description">
                          <FormattedMessage
                            id="children_from"
                            defaultMessage="{from} - {til}"
                            values={{
                              from: options.bookingForm
                                ? options.bookingForm.children_from || "3"
                                : "3",
                              til: options.bookingForm
                                ? options.bookingForm.children_til || "17"
                                : "17"
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {options.bookingForm &&
                    !options.bookingForm.babies ? null : (
                      <div className="form-row inline">
                        <label htmlFor="babies">
                          <FormattedMessage id="babies" />
                        </label>
                        <Field component="select" name="babies">
                          {children.map(opt => {
                            return (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            );
                          })}
                        </Field>
                        <div>
                          <div className="age-description">
                            <FormattedMessage
                              id="babies_from"
                              defaultMessage="< {babies}"
                              values={{
                                babies: options.bookingForm
                                  ? options.bookingForm.babies_til || "2"
                                  : "2"
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    {errors.max_persons && (
                      <div className="error-message">{errors.max_persons}</div>
                    )}                    
                    {errors.max_persons && (
                      <div className="error-message">{errors.max_persons}</div>
                    )}
                  </div>
                  <Discount errors={errors} house={house} />

                  <Insurances house={house} />

                  {bookingPrice.optional_house_costs.length > 0 ? (
                    <div className="form-section">
                      <h2>
                        <FormattedMessage id="extra_costs_bookable" />
                      </h2>
                      <div>
                        {bookingPrice.optional_house_costs.map(cost => {
                          if (
                            !includes(["none", "total"], cost.method) &&
                            cost.max_available > 0
                          ) {
                            return (
                              <div className="form-row inline" key={cost.id}>
                                <label htmlFor={cost.id}>{cost.name}</label>
                                <Field
                                  component="select"
                                  name={`costs[${cost.id}]`}
                                >
                                  {this.createPeronsArray(
                                    cost.max_available
                                  ).map(opt => {
                                    return (
                                      <option key={opt} value={opt}>
                                        {opt}
                                      </option>
                                    );
                                  })}
                                </Field>

                                <div className="price_per">
                                  €{" "}
                                  <FormattedNumber
                                    value={cost.amount}
                                    minimumFractionDigits={2}
                                    maximumFractionDigits={2}
                                  />{" "}
                                  {cost.method_name}
                                </div>
                                <div>
                                  {cost.description ? (
                                    <div>
                                      <Modal buttonText={<Icon />}>
                                        <p>{cost.description}</p>
                                      </Modal>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          } else {
                            return "";
                          }
                        })}
                      </div>
                    </div>
                  ) : null}
                  <OptionalBookingFields
                    bookingFields={this.state.bookingFields}
                    errors={errors}
                    PortalSite={PortalSite}
                  />
                </div>

                <div className="form-sum">
                  <Summary house={house} bookingPrice={bookingPrice} />

                  {house.allow_option && (
                    <div>
                      <RadioButtonGroup
                        id="is_option"
                        className="booking_option"
                      >
                        <Field
                          component={RadioButton}
                          name="is_option"
                          id="true"
                          disabled={!house.allow_option}
                          label={<FormattedMessage id="option" />}
                        />
                        <Field
                          component={RadioButton}
                          name="is_option"
                          id="false"
                          label={<FormattedMessage id="booking" />}
                        />
                      </RadioButtonGroup>
                    </div>
                  )}

                  <div className="costs-section">
                    <table>
                      <tbody>
                        <tr>
                          <td>
                            <FormattedMessage id="rent_price" />
                          </td>
                          <td className="price">
                            €{" "}
                            <FormattedNumber
                              value={this.calculateRentPrice(values).rent_price}
                              minimumFractionDigits={2}
                              maximumFractionDigits={2}
                            />
                          </td>
                        </tr>
                        {this.calculateRentPrice(values).discount ? (
                          <tr>
                            <td>
                              <FormattedMessage id="discount" />
                            </td>
                            <td className="price">
                              <FormattedNumber
                                value={this.calculateRentPrice(values).discount}
                              />{" "}
                              %
                            </td>
                          </tr>
                        ) : null}
                        {this.calculateRentPrice(values).discount ? (
                          <tr>
                            <td>
                              <FormattedMessage id="price_after_discount" />
                            </td>
                            <td className="price">
                              €{"  "}
                              <FormattedNumber
                                value={
                                  this.calculateRentPrice(values)
                                    .discounted_price
                                }
                                minimumFractionDigits={2}
                                maximumFractionDigits={2}
                              />
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                  <div className="costs-section">
                    <table>
                      <tbody>
                        {this.calculateInsurances(values).map(ins => {
                          return (
                            <tr key={ins.name}>
                              <td>
                                <FormattedMessage id={ins.name} />
                              </td>
                              <td className="price">
                                €{"  "}
                                <FormattedNumber
                                  value={ins.price}
                                  minimumFractionDigits={2}
                                  maximumFractionDigits={2}
                                />
                              </td>
                            </tr>
                          );
                        })}
                        {bookingPrice.required_house_costs.map(cost => {
                          if (!cost.on_site) {
                            if (cost.method === "none") {
                              return (
                                <tr key={cost.id}>
                                  <td>{cost.name}</td>
                                  <td className="price">{cost.method_name}</td>
                                </tr>
                              );
                            } else {
                              return (
                                <tr key={cost.id}>
                                  <td>{cost.name}</td>
                                  <td className="price">
                                    €{"  "}
                                    <FormattedNumber
                                      value={this.calculateCost(cost, values)}
                                      minimumFractionDigits={2}
                                      maximumFractionDigits={2}
                                    />
                                  </td>
                                </tr>
                              );
                            }
                          }
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="costs-section">
                    <table>
                      <tbody>
                        {bookingPrice.optional_house_costs.map(cost => {
                          if (!cost.on_site) {
                            if (cost.method === "none") {
                              return (
                                <tr key={cost.id}>
                                  <td>{cost.name}</td>
                                  <td className="price">
                                    {cost.amount && cost.amount > 0 && (
                                      <span>
                                        €{" "}
                                        <FormattedNumber
                                          value={cost.amount}
                                          minimumFractionDigits={2}
                                          maximumFractionDigits={2}
                                        />
                                      </span>
                                    )}
                                    {cost.method_name}{" "}
                                    <Description
                                      description={cost.description}
                                    />
                                  </td>
                                </tr>
                              );
                            } else {
                              return (
                                <tr key={cost.id}>
                                  <td>
                                    {cost.name}{" "}
                                    <Description
                                      description={cost.description}
                                    />
                                  </td>
                                  <td className="price">
                                    €{" "}
                                    <FormattedNumber
                                      value={this.calculateCost(cost, values)}
                                      minimumFractionDigits={2}
                                      maximumFractionDigits={2}
                                    />
                                  </td>
                                </tr>
                              );
                            }
                          }
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="costs-section">
                    <strong>
                      <FormattedMessage id="costs_on_site" />
                    </strong>
                    <table>
                      <tbody>
                        {bookingPrice.required_house_costs.map(cost => {
                          if (cost.on_site) {
                            if (cost.method === "none") {
                              return (
                                <tr key={cost.id}>
                                  <td>{cost.name}</td>
                                  <td className="price">{cost.method_name}</td>
                                </tr>
                              );
                            } else {
                              return (
                                <tr key={cost.id}>
                                  <td>{cost.name}</td>
                                  <td className="price">
                                    €{"  "}
                                    <FormattedNumber
                                      value={this.calculateCost(cost, values)}
                                      minimumFractionDigits={2}
                                      maximumFractionDigits={2}
                                    />
                                  </td>
                                </tr>
                              );
                            }
                          }
                        })}
                        {bookingPrice.optional_house_costs.map(cost => {
                          if (cost.on_site) {
                            if (cost.method === "none") {
                              return (
                                <tr key={cost.id}>
                                  <td>
                                    {cost.name}
                                    {cost.description ? (
                                      <span>{cost.description}</span>
                                    ) : null}
                                  </td>
                                  <td className="price">
                                    {cost.amount && cost.amount > 0 && (
                                      <span>
                                        €{" "}
                                        <FormattedNumber
                                          value={cost.amount}
                                          minimumFractionDigits={2}
                                          maximumFractionDigits={2}
                                        />
                                      </span>
                                    )}
                                    {cost.method_name}
                                  </td>
                                </tr>
                              );
                            } else {
                              return (
                                <tr key={cost.id}>
                                  <td>
                                    {cost.name}
                                    <Description
                                      description={cost.description}
                                    />
                                  </td>
                                  <td className="price">
                                    €{" "}
                                    <FormattedNumber
                                      value={this.calculateCost(cost, values)}
                                      minimumFractionDigits={2}
                                      maximumFractionDigits={2}
                                    />
                                  </td>
                                </tr>
                              );
                            }
                          }
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="costs-section">
                    <table>
                      <tbody>
                        <tr>
                          <th
                            style={{
                              textAlign: "left",
                              testTransform: "capitalize"
                            }}
                          >
                            <FormattedMessage id="total" />
                          </th>
                          <td className="price">
                            €{" "}
                            <FormattedNumber
                              value={this.calculateTotal(values)}
                              minimumFractionDigits={2}
                              maximumFractionDigits={2}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {status && status.msg && <div>{status.msg}</div>}
                  <div className="terms">
                    <FormattedMessage id="agree_with" />{" "}
                    <FormattedMessage id="terms">
                      {fm => (
                        <Modal buttonText={fm}>
                          <div
                            style={{
                              width: "90vh",
                              height: "90vh"
                            }}
                          >
                            <iframe
                              src={house.rental_terms}
                              width="100%"
                              height="100%"
                              title="Terms"
                              frameBorder="0"
                            />
                          </div>
                        </Modal>
                      )}
                    </FormattedMessage>
                  </div>
                  {includes([1, 2], Number(values.cancel_insurance)) ? (
                    <div className="terms">
                      <FormattedMessage id="comply_insurance_card" />
                    </div>
                  ) : null}
                  <button
                    className="button"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    <FormattedMessage id="book" />
                  </button>
                </div>
              </Form>
            )}
          />
        )}
      </Mutation>
    );
  }
}

FormCreator.propTypes = {
  house: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  locale: PropTypes.string.isRequired,
  booking: PropTypes.object.isRequired,
  PortalSite: PropTypes.object.isRequired,
  onReturn: PropTypes.func.isRequired
};

export default FormCreator;

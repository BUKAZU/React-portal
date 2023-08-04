import React from "react";
import { FormattedMessage } from "react-intl";

function Note() {
    return (
        <div className="bu_reviews__note">
            {/* <FormattedMessage id="reviews_note" />
            <br /> */}
            <a href="https://www.bukazu.com" target="_blank" rel="noopener noreferrer">
                <FormattedMessage id="reviews_note_link" />
            </a>
        </div>
    )

}

export default Note;
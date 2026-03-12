import React from "react";
import { t } from "../../intl";

function Note() {
    return (
        <div className="bu_reviews__note">
            {/* <FormattedMessage id="reviews_note" />
            <br /> */}
            <a href="https://www.bukazu.com" target="_blank" rel="noopener noreferrer">
                {t('reviews_note_link')}
            </a>
        </div>
    )

}

export default Note;
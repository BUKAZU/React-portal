import React, { CSSProperties, useContext } from 'react';
import pjson from '../../package.json';
import { AppContext } from './AppContext';

const style: CSSProperties = {
  width: '100%',
  padding: '16px',
  display: 'flex',
  justifyContent: 'center',
  position: 'relative'
};
const styleLink = {
  color: '#808080',
  fontSize: 14,
  textDecoration: 'none'
};

const trans: Trans = {
  nl: {
    url: 'http://bukazu.com/veiligheid',
    label: 'Beveiligd en mogelijk gemaakt door BUKAZU'
  },
  en: {
    url: 'http://bukazu.com/en/security',
    label: 'Secured and made possible by BUKAZU'
  },
  de: {
    url: 'http://bukazu.com/de/sicherheit',
    label: 'Gesichert und ermöglicht durch BUKAZU'
  },
  fr: {
    url: 'http://bukazu.com/fr/securite',
    label: 'Sécurisé et rendu possible par BUKAZU'
  },
  es: {
    url: 'http://bukazu.com/es/seguridad',
    label: 'Asegurado y hecho posible por BUKAZU'
  },
  it: {
    url: 'http://bukazu.com/it/sicurezza',
    label: 'Protetto e reso possibile da BUKAZU'
  }
};

function SafeBooking(): JSX.Element {
  const { locale } = useContext(AppContext);

  return (
    <div style={style}>
      <a href={trans[locale].url} style={styleLink}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          version="1.1"
          x="0px"
          y="0px"
          viewBox="0 0 100 100"
          enableBackground="new 0 0 100 100"
          xmlSpace="preserve"
          width="16px"
          height="16px"
          style={{ marginRight: '4px', fill: '#808080' }}
        >
          <path d="M75.98,41.62h-2.47L73.5,29.31C73.49,15.9,62.58,4.99,49.17,5C35.76,5.01,24.85,15.92,24.86,29.33l0.02,12.31H24  c-4.61,0.01-8.35,3.75-8.34,8.36v36.65c0,4.61,3.75,8.35,8.36,8.35L76,94.97c4.61,0,8.35-3.74,8.34-8.35V49.96  C84.34,45.35,80.59,41.62,75.98,41.62z M33.84,41.64l-0.02-12.31c0-8.47,6.88-15.36,15.35-15.37c8.47,0,15.36,6.89,15.36,15.35  l0.02,12.31L33.84,41.64z" />
        </svg>
        {trans[locale].label}{' '}
        <span
          style={{
            opacity: 0.5,
            fontSize: 9,
            position: 'absolute',
            right: 10,
            bottom: 0
          }}
        >
        </span>
      </a>
    </div>
  );
}

type Trans = {
  nl: LocaleType;
  en: LocaleType;
  de: LocaleType;
  es: LocaleType;
  fr: LocaleType;
  it: LocaleType;
};

type LocaleType = {
  label: string;
  url: string;
};

export default SafeBooking;

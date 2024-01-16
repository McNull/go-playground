import React, {useMemo} from 'react';
import clsx from 'clsx';
import {MessageBar, MessageBarType, useTheme} from '@fluentui/react';

import { Console } from '~/components/inspector/Console';
import {connect, type StatusState} from '~/store';
import type {MonacoSettings} from '~/services/config';
import {
  DEFAULT_FONT,
  getDefaultFontFamily,
  getFontFamily
} from '~/services/fonts';

import './RunOutput.css';

interface OwnProps {}

interface StateProps {
  status?: StatusState
  monaco?: MonacoSettings
}

const fontSize = 13;

const RunOutput: React.FC<StateProps & OwnProps> = ({ status, monaco }) => {
  const theme = useTheme();
  const styles = useMemo(() => {
    const { palette } = theme;
    return {
      backgroundColor: palette.neutralLight,
      color: palette.neutralDark,
      fontFamily: getDefaultFontFamily(),
    }
  }, [theme]);
  const fontFamily = useMemo(() => (
    getFontFamily(monaco?.fontFamily ?? DEFAULT_FONT)
  ), [monaco]);
  const isClean = !status || !status?.dirty;

  return (
    <div className="RunOutput" style={styles}>
      <div
        className={
          clsx(
            'RunOutput__content',
            {'RunOutput__content--padded': isClean || status?.lastError}
          )
        }
      >
        {
          status?.lastError ? (
            <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
              <b className='RunOutput__label'>Error</b>
              <pre className='RunOutput__errors'>
                {status.lastError}
              </pre>
            </MessageBar>
          ) : isClean ? (
            <span
              style={{
                fontFamily,
                fontSize: `${fontSize}px`
              }}
            >
              Press "Run" to compile program.
            </span>
          ) : (
            <Console
              fontFamily={fontFamily}
              fontSize={fontSize}
              status={status}
            />
          )
        }
      </div>
    </div>
  )
}

const ConnectedRunOutput = connect<StateProps, OwnProps>((
  { status, monaco }
) => ({
  status, monaco
}))(RunOutput);

export default ConnectedRunOutput;

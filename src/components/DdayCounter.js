import React, { memo, useCallback, useEffect, useState } from 'react';
import { Text } from 'react-native';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';

function DdayCounter({ targetDate, format, onEnd }) {
  const [ddayStr, setDdayStr] = useState();
  const [intervalId, setIntervalId] = useState();
  const [end, setEnd] = useState(false);

  const getDday = () => {
    const now = moment();
    const then = moment(targetDate);
    const duration = moment.duration(then.diff(now));

    let timeLeft = {};

    if (duration > 0) {
      timeLeft = {
        days: Math.floor(duration.asDays()),
        hours: duration.hours(),
        minutes: duration.minutes(),
        seconds: duration.seconds(),
      };
      let str = '';
      const day = timeLeft.days ? `${timeLeft.days}일` : '';
      const hour = timeLeft.hours ? `${timeLeft.hours}시간` : '';
      const minute = timeLeft.minutes ? `${timeLeft.minutes}분` : '';
      const second = timeLeft.seconds ? `${timeLeft.seconds}초` : '';
      if (day) str = `${day}`;
      if (hour) str += str ? ` ${hour}` : hour;
      if (minute) str += str ? ` ${minute}` : minute;
      if (second) str += str ? ` ${second}` : second;
      setDdayStr(`마감까지 ${str}`);
    } else {
      setDdayStr('');
      setEnd(true);
      if (onEnd) onEnd();
    }
  };

  useFocusEffect(
    useCallback(() => {
      setEnd(false);
      const id = setInterval(getDday, 500);
      setIntervalId(id);
      return () => clearInterval(id);
    }, []),
  );

  useEffect(() => {
    if (end && intervalId) clearInterval(intervalId);
  }, [end, intervalId]);

  return ddayStr && <Text>{ddayStr}</Text>;
}

export default memo(DdayCounter);

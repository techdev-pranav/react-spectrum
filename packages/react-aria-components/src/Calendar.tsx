/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {CalendarProps as BaseCalendarProps, RangeCalendarProps as BaseRangeCalendarProps, DateValue, mergeProps, useCalendar, useCalendarCell, useCalendarGrid, useFocusRing, useHover, useLocale, useRangeCalendar, VisuallyHidden} from 'react-aria';
import {ButtonContext} from './Button';
import {CalendarDate, createCalendar, DateDuration, endOfMonth, getWeeksInMonth, isSameDay, isSameMonth} from '@internationalized/date';
import {CalendarState, RangeCalendarState, useCalendarState, useRangeCalendarState} from 'react-stately';
import {ContextValue, DOMProps, forwardRefType, Provider, RenderProps, SlotProps, StyleProps, useContextProps, useRenderProps} from './utils';
import {createContext, ForwardedRef, forwardRef, ReactElement, useContext} from 'react';
import {DOMAttributes, FocusableElement} from '@react-types/shared';
import {filterDOMProps, useObjectRef} from '@react-aria/utils';
import {HeadingContext} from './Heading';
import React from 'react';
import {TextContext} from './Text';

export interface CalendarProps<T extends DateValue> extends Omit<BaseCalendarProps<T>, 'errorMessage'>, RenderProps<CalendarState>, SlotProps {
  /**
   * The amount of days that will be displayed at once. This affects how pagination works.
   * @default {months: 1}
   */
  visibleDuration?: DateDuration
}

export interface RangeCalendarProps<T extends DateValue> extends Omit<BaseRangeCalendarProps<T>, 'errorMessage'>, RenderProps<RangeCalendarState>, SlotProps {
  /**
   * The amount of days that will be displayed at once. This affects how pagination works.
   * @default {months: 1}
   */
  visibleDuration?: DateDuration
}

export const CalendarContext = createContext<ContextValue<CalendarProps<any>, HTMLDivElement>>({});
export const RangeCalendarContext = createContext<ContextValue<RangeCalendarProps<any>, HTMLDivElement>>({});
const InternalCalendarContext = createContext<CalendarState | RangeCalendarState | null>(null);

function Calendar<T extends DateValue>(props: CalendarProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, CalendarContext);
  let {locale} = useLocale();
  let state = useCalendarState({
    ...props,
    locale,
    createCalendar
  });

  let {calendarProps, prevButtonProps, nextButtonProps, errorMessageProps, title} = useCalendar(props, state);

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-Calendar'
  });

  return (
    <div {...renderProps} {...calendarProps} ref={ref} slot={props.slot}>
      <Provider
        values={[
          [ButtonContext, {
            slots: {
              previous: prevButtonProps,
              next: nextButtonProps
            }
          }],
          [HeadingContext, {'aria-hidden': true, level: 2, children: title}],
          [InternalCalendarContext, state],
          [TextContext, {
            slots: {
              errorMessage: errorMessageProps
            }
          }]
        ]}>
        {/* Add a screen reader only description of the entire visible range rather than
          * a separate heading above each month grid. This is placed first in the DOM order
          * so that it is the first thing a touch screen reader user encounters.
          * In addition, VoiceOver on iOS does not announce the aria-label of the grid
          * elements, so the aria-label of the Calendar is included here as well. */}
        <VisuallyHidden>
          <h2>{calendarProps['aria-label']}</h2>
        </VisuallyHidden>
        {renderProps.children}
        {/* For touch screen readers, add a visually hidden next button after the month grid
          * so it's easy to navigate after reaching the end without going all the way
          * back to the start of the month. */}
        <VisuallyHidden>
          <button
            aria-label={nextButtonProps['aria-label']}
            disabled={nextButtonProps.isDisabled}
            onClick={() => state.focusNextPage()}
            tabIndex={-1} />
        </VisuallyHidden>
      </Provider>
    </div>
  );
}

/**
 * A calendar displays one or more date grids and allows users to select a single date.
 */
const _Calendar = /*#__PURE__*/ (forwardRef as forwardRefType)(Calendar);
export {_Calendar as Calendar};

function RangeCalendar<T extends DateValue>(props: RangeCalendarProps<T>, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, RangeCalendarContext);
  let {locale} = useLocale();
  let state = useRangeCalendarState({
    ...props,
    locale,
    createCalendar
  });

  let {calendarProps, prevButtonProps, nextButtonProps, errorMessageProps, title} = useRangeCalendar(
    props,
    state,
    ref
  );

  let renderProps = useRenderProps({
    ...props,
    values: state,
    defaultClassName: 'react-aria-RangeCalendar'
  });

  return (
    <div {...renderProps} {...calendarProps} ref={ref} slot={props.slot}>
      <Provider
        values={[
          [ButtonContext, {
            slots: {
              previous: prevButtonProps,
              next: nextButtonProps
            }
          }],
          [HeadingContext, {'aria-hidden': true, level: 2, children: title}],
          [InternalCalendarContext, state],
          [TextContext, {
            slots: {
              errorMessage: errorMessageProps
            }
          }]
        ]}>
        {/* Add a screen reader only description of the entire visible range rather than
          * a separate heading above each month grid. This is placed first in the DOM order
          * so that it is the first thing a touch screen reader user encounters.
          * In addition, VoiceOver on iOS does not announce the aria-label of the grid
          * elements, so the aria-label of the Calendar is included here as well. */}
        <VisuallyHidden>
          <h2>{calendarProps['aria-label']}</h2>
        </VisuallyHidden>
        {renderProps.children}
        {/* For touch screen readers, add a visually hidden next button after the month grid
          * so it's easy to navigate after reaching the end without going all the way
          * back to the start of the month. */}
        <VisuallyHidden>
          <button
            aria-label={nextButtonProps['aria-label']}
            disabled={nextButtonProps.isDisabled}
            onClick={() => state.focusNextPage()}
            tabIndex={-1} />
        </VisuallyHidden>
      </Provider>
    </div>
  );
}

/**
 * A range calendar displays one or more date grids and allows users to select a contiguous range of dates.
 */
const _RangeCalendar = /*#__PURE__*/ (forwardRef as forwardRefType)(RangeCalendar);
export {_RangeCalendar as RangeCalendar};

export interface CalendarCellRenderProps {
  /** The date that the cell represents. */
  date: CalendarDate,
  /** The day number formatted according to the current locale. */
  formattedDate: string,
  /**
   * Whether the cell is currently hovered with a mouse.
   * @selector [data-hovered]
   */
   isHovered: boolean,
  /**
   * Whether the cell is currently being pressed.
   * @selector [data-pressed]
   */
  isPressed: boolean,
  /**
   * Whether the cell is selected.
   * @selector [data-selected]
   */
  isSelected: boolean,
  /**
   * Whether the cell is the first date in a range selection.
   * @selector [data-selection-start]
   */
  isSelectionStart: boolean,
  /**
   * Whether the cell is the last date in a range selection.
   * @selector [data-selection-end]
   */
   isSelectionEnd: boolean,
  /**
   * Whether the cell is focused.
   * @selector :focus
   */
  isFocused: boolean,
  /**
   * Whether the cell is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the cell is disabled, according to the calendar's `minValue`, `maxValue`, and `isDisabled` props.
   * Disabled dates are not focusable, and cannot be selected by the user. They are typically
   * displayed with a dimmed appearance.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * Whether the cell is outside the visible range of the calendar.
   * For example, dates before the first day of a month in the same week.
   * @selector [data-outside-visible-range]
   */
  isOutsideVisibleRange: boolean,
  /**
   * Whether the cell is outside the current month.
   * @selector [data-outside-month]
   */
  isOutsideMonth: boolean,
  /**
   * Whether the cell is unavailable, according to the calendar's `isDateUnavailable` prop. Unavailable dates remain
   * focusable, but cannot be selected by the user. They should be displayed with a visual affordance to indicate they
   * are unavailable, such as a different color or a strikethrough.
   *
   * Note that because they are focusable, unavailable dates must meet a 4.5:1 color contrast ratio,
   * [as defined by WCAG](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html).
   *
   * @selector [data-unavailable]
   */
  isUnavailable: boolean,
  /**
   * Whether the cell is part of an invalid selection.
   * @selector [aria-invalid]
   */
  isInvalid: boolean
}

export interface CalendarGridProps extends StyleProps {
  /**
   * Either a function to render calendar cells for each date in the month,
   * or children containing a `<CalendarGridHeader>`` and `<CalendarGridBody>`
   * when additional customization is needed.
   */
  children?: ReactElement | ReactElement[] | ((date: CalendarDate) => ReactElement),
  /**
   * An offset from the beginning of the visible date range that this
   * CalendarGrid should display. Useful when displaying more than one
   * month at a time.
   */
  offset?: DateDuration
}

interface InternalCalendarGridContextValue {
  headerProps: DOMAttributes<FocusableElement>,
  weekDays: string[],
  startDate: CalendarDate
}

const InternalCalendarGridContext = createContext<InternalCalendarGridContextValue | null>(null);

function CalendarGrid(props: CalendarGridProps, ref: ForwardedRef<HTMLTableElement>) {
  let state = useContext(InternalCalendarContext)!;
  let startDate = state.visibleRange.start;
  if (props.offset) {
    startDate = startDate.add(props.offset);
  }

  let {gridProps, headerProps, weekDays} = useCalendarGrid({
    startDate,
    endDate: endOfMonth(startDate)
  }, state);

  return (
    <InternalCalendarGridContext.Provider value={{headerProps, weekDays, startDate}}>
      <table
        {...filterDOMProps(props as any)}
        {...gridProps}
        ref={ref}
        style={props.style}
        className={props.className ?? 'react-aria-CalendarGrid'}>
        {typeof props.children !== 'function'
          ? props.children
          : (<>
            <CalendarGridHeaderForwardRef>
              {day => <CalendarHeaderCellForwardRef>{day}</CalendarHeaderCellForwardRef>}
            </CalendarGridHeaderForwardRef>
            <CalendarGridBodyForwardRef>
              {props.children}
            </CalendarGridBodyForwardRef>
          </>)
        }
      </table>
    </InternalCalendarGridContext.Provider>
  );
}

/**
 * A calendar grid displays a single grid of days within a calendar or range calendar which
 * can be keyboard navigated and selected by the user.
 */
const _CalendarGrid = forwardRef(CalendarGrid);
export {_CalendarGrid as CalendarGrid};

export interface CalendarGridHeaderProps extends StyleProps {
  /** A function to render a `<CalendarHeaderCell>` for a weekday name. */
  children: (day: string) => ReactElement
}

function CalendarGridHeader(props: CalendarGridHeaderProps, ref: ForwardedRef<HTMLTableSectionElement>) {
  let {children, style, className} = props;
  let {headerProps, weekDays} = useContext(InternalCalendarGridContext)!;

  return (
    <thead
      {...filterDOMProps(props as any)}
      {...headerProps}
      ref={ref}
      style={style}
      className={className || 'react-aria-CalendarGridHeader'}>
      <tr>
        {weekDays.map((day, key) => React.cloneElement(children(day), {key}))}
      </tr>
    </thead>
  );
}

/**
 * A calendar grid header displays a row of week day names at the top of a month.
 */
const CalendarGridHeaderForwardRef = forwardRef(CalendarGridHeader);
export {CalendarGridHeaderForwardRef as CalendarGridHeader};

export interface CalendarHeaderCellProps extends DOMProps {}

function CalendarHeaderCell(props: CalendarHeaderCellProps, ref: ForwardedRef<HTMLTableCellElement>) {
  let {children, style, className} = props;
  return (
    <th
      {...filterDOMProps(props as any)}
      ref={ref}
      style={style}
      className={className || 'react-aria-CalendarHeaderCell'}>
      {children}
    </th>
  );
}

/**
 * A calendar header cell displays a week day name at the top of a column within a calendar.
 */
const CalendarHeaderCellForwardRef = forwardRef(CalendarHeaderCell);
export {CalendarHeaderCellForwardRef as CalendarHeaderCell};

export interface CalendarGridBodyProps extends StyleProps {
  /** A function to render a `<CalendarCell>` for a given date. */
  children: (date: CalendarDate) => ReactElement
}

function CalendarGridBody(props: CalendarGridBodyProps, ref: ForwardedRef<HTMLTableSectionElement>) {
  let {children, style, className} = props;
  let state = useContext(InternalCalendarContext)!;
  let {startDate} = useContext(InternalCalendarGridContext)!;
  let {locale} = useLocale();
  let weeksInMonth = getWeeksInMonth(startDate, locale);

  return (
    <tbody
      {...filterDOMProps(props as any)}
      ref={ref}
      style={style}
      className={className || 'react-aria-CalendarGridBody'}>
      {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
        <tr key={weekIndex}>
          {state.getDatesInWeek(weekIndex, startDate).map((date, i) => (
            date
              ? React.cloneElement(children(date), {key: i})
              : <td key={i} />
          ))}
        </tr>
      ))}
    </tbody>
  );
}

/**
 * A calendar grid body displays a grid of calendar cells within a month.
 */
const CalendarGridBodyForwardRef = forwardRef(CalendarGridBody);
export {CalendarGridBodyForwardRef as CalendarGridBody};

export interface CalendarCellProps extends RenderProps<CalendarCellRenderProps> {
  /** The date to render in the cell. */
  date: CalendarDate
}

function CalendarCell({date, ...otherProps}: CalendarCellProps, ref: ForwardedRef<HTMLDivElement>) {
  let state = useContext(InternalCalendarContext)!;
  let {startDate: currentMonth} = useContext(InternalCalendarGridContext)!;
  let objectRef = useObjectRef(ref);
  let {cellProps, buttonProps, ...states} = useCalendarCell(
    {date},
    state,
    objectRef
  );

  let {hoverProps, isHovered} = useHover({isDisabled: states.isDisabled});
  let {focusProps, isFocusVisible} = useFocusRing();
  let isOutsideMonth = !isSameMonth(currentMonth, date);
  let isSelectionStart = false;
  let isSelectionEnd = false;
  if ('highlightedRange' in state && state.highlightedRange) {
    isSelectionStart = isSameDay(date, state.highlightedRange.start);
    isSelectionEnd = isSameDay(date, state.highlightedRange.end);
  }

  let renderProps = useRenderProps({
    ...otherProps,
    defaultChildren: states.formattedDate,
    defaultClassName: 'react-aria-CalendarCell',
    values: {
      date,
      isHovered,
      isOutsideMonth,
      isFocusVisible,
      isSelectionStart,
      isSelectionEnd,
      ...states
    }
  });

  let dataAttrs = {
    'data-hovered': isHovered || undefined,
    'data-pressed': states.isPressed || undefined,
    'data-unavailable': states.isUnavailable || undefined,
    'data-disabled': states.isDisabled || undefined,
    'data-focus-visible': isFocusVisible || undefined,
    'data-outside-visible-range': states.isOutsideVisibleRange || undefined,
    'data-outside-month': isOutsideMonth || undefined,
    'data-selected': states.isSelected || undefined,
    'data-selection-start': isSelectionStart || undefined,
    'data-selection-end': isSelectionEnd || undefined
  };

  return (
    <td {...cellProps}>
      <div {...mergeProps(buttonProps, focusProps, hoverProps, dataAttrs, renderProps)} ref={objectRef} />
    </td>
  );
}

/**
 * A calendar cell displays a date cell within a calendar grid which can be selected by the user.
 */
const _CalendarCell = forwardRef(CalendarCell);
export {_CalendarCell as CalendarCell};

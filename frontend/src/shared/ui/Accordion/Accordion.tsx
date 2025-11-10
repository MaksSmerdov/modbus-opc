import { forwardRef, type ReactNode } from 'react';
import {
    Accordion as MuiAccordion,
    AccordionSummary as MuiAccordionSummary,
    AccordionDetails as MuiAccordionDetails,
    type AccordionProps as MuiAccordionProps,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import classNames from 'classnames';
import styles from './Accordion.module.scss';

export interface AccordionProps extends Omit<MuiAccordionProps, 'className'> {
    className?: string;
    summary: ReactNode;
    children: ReactNode;
    defaultExpanded?: boolean;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
    ({ className, summary, children, defaultExpanded = false, ...props }, ref) => {
        const accordionClasses = classNames(styles['accordion'], className);

        return (
            <MuiAccordion
                {...props}
                ref={ref}
                defaultExpanded={defaultExpanded}
                className={accordionClasses}
                classes={{
                    root: styles['accordion__root'],
                    expanded: styles['accordion_expanded'],
                }}
            >
                <MuiAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    className={styles['accordion__summary']}
                    classes={{
                        root: styles['accordion__summaryRoot'],
                        expanded: styles['accordion__summaryExpanded'],
                        content: styles['accordion__summaryContent'],
                    }}
                >
                    {summary}
                </MuiAccordionSummary>
                <MuiAccordionDetails
                    className={styles['accordion__details']}
                    classes={{
                        root: styles['accordion__detailsRoot'],
                    }}
                >
                    {children}
                </MuiAccordionDetails>
            </MuiAccordion>
        );
    }
);

Accordion.displayName = 'Accordion';


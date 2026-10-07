import { Label } from '@/components/ui/label';
import type { SalaryBounds } from '@/types/job-application';

type Props = {
    bounds: SalaryBounds;
    boundsAreCurrent: boolean;
    currency: string;
    minimum: number;
    maximum: number;
    enabled: boolean;
    onEnabledChange: (enabled: boolean) => void;
    onRangeChange: (minimum: number, maximum: number) => void;
    currencyRequired: boolean;
};

function formatAmount(amount: number, currency: string): string {
    const formatted = new Intl.NumberFormat(undefined, {
        style: currency ? 'currency' : 'decimal',
        ...(currency ? { currency } : {}),
        maximumFractionDigits: 0,
    }).format(amount);

    return currency ? formatted : `${formatted} (currency unspecified)`;
}

export function SalaryRangeFilter({
    bounds,
    boundsAreCurrent,
    currency,
    minimum,
    maximum,
    enabled,
    onEnabledChange,
    onRangeChange,
    currencyRequired,
}: Props) {
    if (currencyRequired) {
        return (
            <div className="grid gap-2">
                <Label>Salary range</Label>
                <p className="text-sm text-muted-foreground">
                    Choose a currency to load comparable salary bounds.
                </p>
            </div>
        );
    }

    if (!boundsAreCurrent) {
        return (
            <div className="grid gap-2">
                <Label>Salary range</Label>
                <p className="text-sm text-muted-foreground">
                    Apply the selected currency to load matching salary bounds.
                </p>
            </div>
        );
    }

    if (bounds.minimum === null || bounds.maximum === null) {
        return (
            <div className="grid gap-2">
                <Label>Salary range</Label>
                <p className="text-sm text-muted-foreground">
                    No salary information is available for this currency.
                </p>
            </div>
        );
    }

    const boundMinimum = bounds.minimum;
    const boundMaximum = bounds.maximum;
    const hasAdjustableRange = boundMinimum < boundMaximum;

    return (
        <fieldset className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
                <legend className="text-sm font-medium">Salary range</legend>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(event) =>
                            onEnabledChange(event.target.checked)
                        }
                    />
                    Filter by salary
                </label>
            </div>

            <div className="flex justify-between gap-3 text-sm font-medium">
                <output>{formatAmount(minimum, currency)}</output>
                <output>{formatAmount(maximum, currency)}</output>
            </div>
            {hasAdjustableRange ? (
                <div className="grid gap-3">
                    <label className="grid gap-1 text-xs text-muted-foreground">
                        Minimum
                        <input
                            aria-label="Minimum salary"
                            type="range"
                            min={boundMinimum}
                            max={boundMaximum}
                            step="100"
                            value={minimum}
                            onChange={(event) => {
                                onEnabledChange(true);
                                onRangeChange(
                                    Math.min(
                                        Number(event.target.value),
                                        maximum,
                                    ),
                                    maximum,
                                );
                            }}
                        />
                    </label>
                    <label className="grid gap-1 text-xs text-muted-foreground">
                        Maximum
                        <input
                            aria-label="Maximum salary"
                            type="range"
                            min={boundMinimum}
                            max={boundMaximum}
                            step="100"
                            value={maximum}
                            onChange={(event) => {
                                onEnabledChange(true);
                                onRangeChange(
                                    minimum,
                                    Math.max(
                                        Number(event.target.value),
                                        minimum,
                                    ),
                                );
                            }}
                        />
                    </label>
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">
                    This is the only salary amount available; enabling this
                    filter matches that amount.
                </p>
            )}
            <p className="text-xs text-muted-foreground">
                Available: {formatAmount(boundMinimum, currency)} to{' '}
                {formatAmount(boundMaximum, currency)}
            </p>
        </fieldset>
    );
}

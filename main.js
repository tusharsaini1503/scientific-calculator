
        let display = document.getElementById('result');
        let expression = document.getElementById('expression');
        let currentInput = '';
        let shouldResetDisplay = false;
        let angleMode = 'deg'; // 'deg' or 'rad'

        function setAngleMode(mode) {
            angleMode = mode;
            document.getElementById('deg-btn').classList.toggle('active', mode === 'deg');
            document.getElementById('rad-btn').classList.toggle('active', mode === 'rad');
        }

        function updateDisplay() {
            display.textContent = currentInput || '0';
        }

        function clearAll() {
            currentInput = '';
            expression.textContent = '';
            updateDisplay();
        }

        function clearEntry() {
            currentInput = '';
            updateDisplay();
        }

        function deleteLast() {
            currentInput = currentInput.slice(0, -1);
            updateDisplay();
        }

        function appendNumber(num) {
            if (shouldResetDisplay) {
                currentInput = '';
                shouldResetDisplay = false;
            }
            currentInput += num;
            updateDisplay();
        }

        function appendOperator(op) {
            if (op === '^') {
                currentInput += '²';
                expression.textContent = currentInput;
                return;
            }
            
            if (shouldResetDisplay) {
                shouldResetDisplay = false;
            }
            currentInput += op;
            updateDisplay();
        }

        function appendFunction(mathFunc, displayFunc) {
            if (shouldResetDisplay) {
                currentInput = '';
                shouldResetDisplay = false;
            }
            currentInput += displayFunc;
            updateDisplay();
        }

        function appendConstant(mathConst, displayConst) {
            if (shouldResetDisplay) {
                currentInput = '';
                shouldResetDisplay = false;
            }
            currentInput += displayConst;
            updateDisplay();
        }

        function toggleSign() {
            if (currentInput) {
                if (currentInput.startsWith('-')) {
                    currentInput = currentInput.substring(1);
                } else {
                    currentInput = '-' + currentInput;
                }
                updateDisplay();
            }
        }

        function reciprocal() {
            if (currentInput) {
                try {
                    let value = parseFloat(currentInput);
                    if (value !== 0) {
                        currentInput = (1 / value).toString();
                        updateDisplay();
                        shouldResetDisplay = true;
                    }
                } catch (e) {
                    display.textContent = 'Error';
                }
            }
        }

        function random() {
            currentInput = Math.random().toString();
            updateDisplay();
            shouldResetDisplay = true;
        }

        function factorial(n) {
            if (n < 0) return NaN;
            if (n === 0 || n === 1) return 1;
            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;
            }
            return result;
        }

        function toRadians(degrees) {
            return degrees * (Math.PI / 180);
        }

        function toDegrees(radians) {
            return radians * (180 / Math.PI);
        }

        function preprocessExpression(expr) {
            // Replace display functions with JavaScript Math functions
            expr = expr.replace(/sin\(/g, angleMode === 'deg' ? 'Math.sin(toRadians(' : 'Math.sin(')
                     .replace(/cos\(/g, angleMode === 'deg' ? 'Math.cos(toRadians(' : 'Math.cos(')
                     .replace(/tan\(/g, angleMode === 'deg' ? 'Math.tan(toRadians(' : 'Math.tan(')
                     .replace(/asin\(/g, angleMode === 'deg' ? 'toDegrees(Math.asin(' : 'Math.asin(')
                     .replace(/acos\(/g, angleMode === 'deg' ? 'toDegrees(Math.acos(' : 'Math.acos(')
                     .replace(/atan\(/g, angleMode === 'deg' ? 'toDegrees(Math.atan(' : 'Math.atan(')
                     .replace(/sinh\(/g, 'Math.sinh(')
                     .replace(/cosh\(/g, 'Math.cosh(')
                     .replace(/tanh\(/g, 'Math.tanh(')
                     .replace(/log\(/g, 'Math.log10(')
                     .replace(/ln\(/g, 'Math.log(')
                     .replace(/e\^/g, 'Math.exp')
                     .replace(/√\(/g, 'Math.sqrt(')
                     .replace(/\|/g, 'Math.abs(')
                     .replace(/floor\(/g, 'Math.floor(')
                     .replace(/ceil\(/g, 'Math.ceil(')
                     .replace(/!\(/g, 'factorial(')
                     .replace(/π/g, 'Math.PI')
                     .replace(/e(?![x\d])/g, 'Math.E')
                     .replace(/²/g, '**2')
                     .replace(/×/g, '*');

            // Handle implicit multiplication
            expr = expr.replace(/(\d)(\()/g, '$1*(');
            expr = expr.replace(/(\))(\d)/g, '$1*$2');
            expr = expr.replace(/(\))\(/g, '$1*(');

            return expr;
        }

        function calculate() {
            if (!currentInput) return;

            try {
                expression.textContent = currentInput;
                let processedExpression = preprocessExpression(currentInput);
                
                // Create a safe evaluation environment
                let result = Function(`
                    "use strict";
                    const toRadians = ${toRadians.toString()};
                    const toDegrees = ${toDegrees.toString()};
                    const factorial = ${factorial.toString()};
                    return ${processedExpression};
                `)();

                if (isNaN(result) || !isFinite(result)) {
                    throw new Error('Invalid calculation');
                }

                currentInput = result.toString();
                updateDisplay();
                shouldResetDisplay = true;
            } catch (error) {
                display.textContent = 'Error';
                currentInput = '';
                setTimeout(() => {
                    updateDisplay();
                }, 1500);
            }
        }

        // Keyboard support
        document.addEventListener('keydown', function(event) {
            const key = event.key;
            
            if (key >= '0' && key <= '9') {
                appendNumber(key);
            } else if (key === '.') {
                appendNumber('.');
            } else if (key === '+') {
                appendOperator('+');
            } else if (key === '-') {
                appendOperator('-');
            } else if (key === '*') {
                appendOperator('*');
            } else if (key === '/') {
                event.preventDefault();
                appendOperator('/');
            } else if (key === '%') {
                appendOperator('%');
            } else if (key === '(') {
                appendOperator('(');
            } else if (key === ')') {
                appendOperator(')');
            } else if (key === 'Enter' || key === '=') {
                calculate();
            } else if (key === 'Escape') {
                clearAll();
            } else if (key === 'Backspace') {
                deleteLast();
            }
        });

        // Initialize display
        updateDisplay();
  
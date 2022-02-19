const equation = {
    v: 0, t: 0, p: 0, n: 0
}
function getResType() {
    return document.querySelector('#selectRes').value
}

function converterSI(type, unit, reverse = false) {
    switch (type) {
        case 'v':
            switch (unit) {
                case 'l':
                    return !reverse ? ((l) => (l * 0.001)) : ((m) => (m / 0.001))
                case 'cm':
                    return !reverse ? ((cm) => (cm * Math.pow(10, -6))) : ((m) => m / Math.pow(10, -6))
                default:
                    return (m) => m;
            }
        case 't':
            switch (unit) {
                case 'c':
                    return !reverse ? ((c) => (c + 273.15)) : ((k) => (k - 273.15))
                case 'f':
                    return !reverse ? ((f) => ((f - 32) * 5 / 9 + 273.15)) : ((k) => ((k - 273.15) * 9 / 5 + 32))
                default:
                    return (k) => k;
            }
        case 'p':
            switch (unit) {
                case 'a':
                    return !reverse ? ((a) => (a * 101325)) : ((p) => (p / 101325))
                case 'b':
                    return !reverse ? ((b) => (b * 100000)) : ((p) => (p / 100000))
                default:
                    return (p) => p;
            }
        default:
            return (n) => n;
    }
} //Переводит введенные данные в систему СИ/ из нее для дальнейшего рассчета
function calculate(v = equation.v, t = equation.t, p = equation.p, n = equation.n, resT = getResType()) {
    const r = 8.314
    switch (resT) {
        case 'v':
            if (p <= 0) {
                showMsgHolder('Давление должно быть положительным числом','#alertHolder')
                return false;
            }
            if (n <= 0) {
                showMsgHolder('Количество моль должно быть положительным числом','#alertHolder')
                return false;
            }
            equation.v = r * n * t / p
            return true;
        case 't':
            if (v <= 0) {
                showMsgHolder('Объем должен быть положительным числом','#alertHolder')
                return false;
            }
            if (p <= 0) {
                showMsgHolder('Давление должно быть положительным числом','#alertHolder')
                return false;
            }
            if (n <= 0) {
                showMsgHolder('Количество моль должно быть положительным числом','#alertHolder')
                return false;
            }
            equation.t = p * v / (r * n)
            return true;
        case 'p':
            if (v <= 0) {
                showMsgHolder('Объем должен быть положительным числом','#alertHolder')
                return false;
            }
            if (n <= 0) {
                showMsgHolder('Количество моль должно быть положительным числом','#alertHolder')
                return false;
            }
            equation.p = r * n * t / v
            return true;
        case 'n':
            if (v <= 0) {
                showMsgHolder('Объем должен быть положительным числом','#alertHolder')
                return false;
            }
            if (p <= 0) {
                showMsgHolder('Давление должно быть положительным числом','#alertHolder')
                return false;
            }
            equation.n = t > 0 ? p * v / (r * t) : 0
            return true
        default:
            showMsgHolder('Ошибка на этапе вычислений','#alertHolder')
            return false;
    }
}

function getRes() {
    const resType = getResType()
    const resUnit = document.querySelector(`#${resType}Type`)
    document.querySelector('#resValue').innerHTML = converterSI(resType, resUnit.value, true)(equation[resType]).toFixed(2)

    document.querySelector('#resUnit').innerHTML = (resType === 'n') ? resUnit.textContent : resUnit.selectedOptions[0].textContent
    const resBlock = document.querySelector('#resBlock')
    if (resBlock.classList.contains('hidden')) resBlock.classList.remove('hidden')
    hideMsgHolder('#alertHolder')

}

function calcPerformance() {
    const resType = getResType()
    function getInput() {
        const eqTypes = document.querySelectorAll('#selectRes > option');
        for (let i = 0; i < eqTypes.length; i++) {
            const eqType = eqTypes[i].value
            if (eqType === resType) continue
            const value = parseFloat(document.querySelector(`#${eqType}InputBlock > input`).value)
            if (isNaN(value)) {
                showMsgHolder(`Значение в поле ${document.querySelector(`#${eqType}InputBlock > p`).innerText} не является корректным`, '#alertHolder')
                return false;
            }
            equation[eqType] = converterSI(eqType, document.querySelector(`#${eqType}Type`).value)(value)
        }
        return true;
    }

    if (getInput())
        if (calculate())
            getRes()

}

function fillInput(resType = 'v', resUnit = 'm', ...typeValueUnit) {
    const selectRes = document.querySelector('#selectRes')
    selectRes.value = resType
    if (resType !== 'n'){
        document.querySelector(`#${resType}Type`).value = resUnit
    }
    onResTypeChange()
    typeValueUnit.forEach((v) => {
        const [type, value, unit] = v
         const inputBlock = document.querySelector(`#${type}InputBlock`)
         inputBlock.querySelector('input').value = value
         if(type!=='n') inputBlock.querySelector(`#${type}Type`).value = unit
    })
}

function debugTests() {
    function test(name, v, res) {
        console.log(`Test[${name}]: {${v} | ${res}} %c${v === res ? '+' : '-'}`, `background: ${v === res ? 'green' : 'red'}`)
    }

    function testConverter() {
        console.log('converterTests')
        test('SI:vL', converterSI('v', 'l', false)(1), 0.001)
        test('SI:vCm', converterSI('v', 'cm', false)(1), 0.000001)
        test('SI:vM', converterSI('v', 'm', false)(1), 1)
        test('SI:vLRev', converterSI('v', 'l', true)(1), 1000)
        test('SI:vCmRev', converterSI('v', 'cm', true)(1), 1000000)
        test('SI:vMRev', converterSI('v', 'm', true)(1), 1)

        test('SI:tK', converterSI('t', 'k', false)(1), 1)
        test('SI:tC', converterSI('t', 'c', false)(1), 274.15)
        test('SI:tF', converterSI('t', 'f', false)(1).toFixed(3), '255.928')
        test('SI:tKRev', converterSI('t', 'k', true)(1), 1)
        test('SI:tCRev', converterSI('t', 'c', true)(1), -272.15)
        test('SI:tFRev', converterSI('t', 'f', true)(1).toFixed(2), '-457.87')


        test('SI:pA', converterSI('p', 'a', false)(1), 1 * 101325)
        test('SI:pB', converterSI('p', 'b', false)(1), 100000)
        test('SI:pP', converterSI('p', 'p', false)(1), 1)
        test('SI:pARev', converterSI('p', 'a', true)(1), 1 / 101325)
        test('SI:pBRev', converterSI('p', 'b', true)(1), 0.00001)
        test('SI:pPRev', converterSI('p', 'p', true)(1), 1)


    }

    function testCalculation() {
        console.log('calcTest')
        calculate(1, 1, 1, 1, 'v')
        test('calcV', equation.v.toFixed(2), '8.31')
        calculate(1, 1, 1, 1, 't')
        test('calcT', equation.t.toFixed(2), '0.12')
        calculate(1, 1, 1, 1, 'p')
        test('calcT', equation.p.toFixed(2), '8.31')
        calculate(1, 1, 1, 1, 'n')
        test('calcT', equation.n.toFixed(2), '0.12')

    }

    testConverter()
    testCalculation()
} // тест конвертера и калькулятора
//debugTests() // Тесты пройдены
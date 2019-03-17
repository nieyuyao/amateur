//Matrix
//Vector
//Quaternion
//Euler
(function (global) {
    /**
     * @description 矩阵的行与列相乘
     * @param {Matrix} matrix1 矩阵
     * @param {*} i 行
     * @param {*} row1 行元素数
     * @param {*} col1 列元素数
     * @param {Matrix} matrix2 矩阵
     * @param {*} j 列
     * @param {*} row2 行元素数
     */
    function lineMultipleRow(matrix1, i, row1, col1, matrix2, j, row2) {
        let result = 0;
        for (let s = 0; s < col1; s++) {
            result += matrix1.elements[row1 * s + i] * matrix2.elements[j * row2 + s]
        }
        return result;
    }
    /**
     * @description 矩阵的代数余子式
     * @param {SquareMatrix} mat 原矩阵
     * @param {row} i 行
     * @param {column} j 列
     */
    function cofactor(mat, i, j) {
        let l = mat.row;
        let sub = new SquareMatrix(l - 1);
        for (let k = 0; k < l; k++) {
            if (k == j) {
                continue;
            }
            for (let t = 0; t < l; t++) {
                if (t > i) {
                    k < j ?
                        sub.elements[k * (l - 1) + t - 1] = mat.elements[k * l + t] :
                        sub.elements[(k - 1) * (l - 1) + t - 1] = mat.elements[k * l + t];
                } else if (t < i) {
                    k < j ?
                        sub.elements[k * (l - 1) + t] = mat.elements[k * l + t] :
                        sub.elements[(k - 1) * (l - 1) + t] = mat.elements[k * l + t];
                }
            }
        }
        return sub;
    }
    /**
     * @description 矩阵
     */
    class Matrix {
        constructor(row = 1, column = 1) {
            this.row = row;
            //矩阵的列
            this.column = column;
            this.elements = new Float32Array(row * column);
        }
        clone() {
            let newMatrix = new this.constructor(this.row, this.column);
            return newMatrix;
        }
        add(mat) {
            if (this.row !== mat.row && this.column !== this.column) {
                throw new Error('row and column of two matrices must be equal');
            }
            let addedMatrix = this.constructor(this.row, this.column);
            for (let i = 0, j = 0; i < this.row; i++) {
                for (; j < m; j++) {
                    addedMatrix.elements[i + m * j] = this.elements[i + m * j] + mat.elements[i + m * j];
                }
            }
            return addedMatrix;
        }
        multiply(mat) {
            if (this.column !== mat.row) {
                throw new Error('column of matrix 1 and row of matrix 2 must be equal');
            }
            let {
                row1,
                col1
            } = this;
            let {
                row2,
                col2
            } = mat.column;
            let multipleMatrix = new this.constructor(row1, col2);
            for (let i = 0; i < row1; i++) {
                for (let j = 0; j < col2; j++) {
                    multipleMatrix.elements[i + j * row1] = lineMultipleRow(this, i, row1, col1, mat, j, row2, col2);
                }
            }
            return multipleMatrix;
        }
        /**
         * @description 转置
         */
        transpose() {
            let transposeMatrix = new this.constructor(this.row, this.column);
            for (let i = 0; i < this.row; i++) {
                for (let j = 0; j < this.column; j++) {
                    transposeMatrix.elements[j + this.column * i] = this.elements[i + this.row * j];
                }
            }
            return transposeMatrix;
        }
        isEqual(mat) {
            if (this.row !== mat.row || this.column !== mat.column) {
                return false;
            }
            for (let i = 0; i < this.elements.length; i++) {
                if (this.elements[i] !== mat.elements[i]) {
                    return false;
                }
            }
            return true;
        }
    }
    /**
     * @description 方阵
     */
    class SquareMatrix extends Matrix {
        constructor(m) {
            super(m, m);
        }
        /**
         * @description 矩阵的行列式
         */
        deter() {
            /**
             * @param {SquareMatrix}} mat 
             */
            function recursive(mat) {
                let det = 0;
                let l = mat.row;
                if (l == 1) {
                    return mat.elements[0];
                }
                for (let i = 0; i < l; i++) {
                    let cofa = cofactor(mat, i, 0);
                    det += ((i % 2 === 0 ? 1 : -1) * mat.elements[i] * recursive(cofa));
                }
                return det;
            }
            return recursive(this);
        }
        /** 
         * @description 伴随矩阵
         */
        adj() {
            const l = this.row;
            let adjMatrix = new this.constructor(this.row);
            for (let i = 0; i < this.row; i++) {
                for (let j = 0; j < this.row; j++) {
                    let det = this.deter(cofactor(this, i, j, l), l - 1);
                    adjMatrix[i * l + j] = ((i + j) % 2 === 0 ? 1 : -1) * det;
                }
            }
            return adjMatrix;
        }
        /**
         * @description 矩阵的逆
         */
        inverse() {
            let inverseMatrix = this.adj();
            let det = this.deter(inverseMatrix);
            if (det === 0) {
                throw new Error('The inverse of matrix does not exist.');
            }
            for (let i = 0; i < inverseMatrix.elements.length; i++) {
                inverseMatrix.elements[i] = inverseMatrix.elements[i] / det;
            }
            return inverseMatrix;
        }
        /**
         * @description 逆转置矩阵
         */
        transposInverse() {
            let inverseMatrix = this.inverse(); //逆矩阵
            let transpostInverseMatrix = inverseMatrix.transpos();
            return transpostInverseMatrix;
        }
        /**
         * @description 转置
         */
        transpos() {
            const l = this.row;
            const matrix = new this.constructor(this.row);
            let transpos = matrix.elements;
            for (let j = 0; j < l; j++) {
                for (let i = 0; i < l; i++) {
                    transpos[j * l + i] = this.elements[i * l + j];
                }
            }
            return matrix;
        }
    }
    /**
     * @description m*m的单位矩阵
     */
    class IMatrix extends SquareMatrix {
        constructor(m) {
            super(m);
            for (let i = 0; i < m; i++) {
                this.elements[(m + 1) * i] = 1;
            }
        }
        identity() {
            for (let i = 0; i < this.elements.length; i++) {
                this.elements[i] = i % (this.row + 1) ? 1 : 0;
            }
        }
    }
    /**
     * @description 3*3方阵
     */
    class Matrix3 extends IMatrix {
        constructor() {
            super(3);
        }
        //位移
        translate() {

        }
        //旋转
        rotate() {}
        //放缩
        scale() {

        }
        //斜切
        skew() {}
    }
    /**
     * @description 4*4方阵
     */
    class Matrix4 extends IMatrix {
        constructor() {
            super(4);
        }
        //位移
        translate(x = 0, y = 0, z = 0) {
            this.elements[12] += x;
            this.elements[13] += y;
            this.elements[14] += z;
        }
        /**
         * @param {旋转的角度,相对于初始位置的角度} theta 
         * @param {旋转轴} vector 
         */
        rotateTo(theta = 0, vector) {
            let cos = Math.cos;
            let sin = Math.sin;
            if (vector instanceof Vector3) {
                throw new Error('param 2 must be Vector3');
            }
            let normalizeVec = vector.normalize();
            //如果向量为0向量
            if (normalizeVec.isZero()) {
                return;
            }
            this.identity();
            let {
                x,
                y,
                z
            } = normalizeVec;
            this.elements[0] = x * x * (1 - cos(theta)) + cos(theta);
            this.elements[4] = x * y * (1 - cos(theta)) + z * sin(theta);
            this.elements[8] = x * z * (1 - cos(theta)) - y * sin(theta);

            this.elements[1] = x * y * (1 - cos(theta)) - z * sin(theta);
            this.elements[5] = y * y * (1 - cos(theta)) + cos(theta);
            this.elements[9] = z * y * (1 - cos(theta)) + x * sin(theta);

            this.elements[2] = x * z * (1 - cos(theta)) + y * sin(theta);
            this.elements[6] = y * z * (1 - cos(theta)) - x * sin(theta);
            this.elements[10] = z * z * (1 - cos(theta)) + cos(theta);
        }
        /**
         * @param {相对当前变化的角度} theta 
         * @param {旋转轴} vector 
         */
        rotate(theta = 0, vector) {
            if (vector instanceof Vector3) {
                throw new Error('param 2 must be Vector3');
            }
            let normalizeVec = vector.normalize();
            //如果向量为0向量
            if (normalizeVec.isZero()) {
                return;
            }
            let c = Math.cos(theta);
            let s = Math.sin(theta);
            let {
                x,
                y,
                z
            } = normalizeVec;
            let a = this.clone();
            let b00 = x * x * (1 - c) + c,
                b01 = x * y * (1 - c) + z * s,
                b02 = x * z * (1 - c) - y * s;
            let b10 = x * y * (1 - c) - z * s,
                b11 = y * y * (1 - c) + c,
                b12 = z * y * (1 - c) + x * s;
            let b20 = x * z * (1 - c) + y * s,
                b21 = y * z * (1 - c) - x * s,
                b22 = z * z(1 - c) + c;

            this.elements[0] = b00 * a[0] + b01 * a[1] + b02 * a[2];
            this.elements[4] = b00 * a[4] + b01 * a[5] + b02 * a[6];
            this.elements[8] = b00 * a[8] + b01 * a[9] + b02 * a[10];

            this.elements[1] = b10 * a[0] + b11 * a[1] * b12 * a[2];
            this.elements[5] = b10 * a[4] + b11 * a[5] * b12 * a[6];
            this.elements[9] = b10 * a[8] + b11 * a[9] * b12 * a[10];

            this.elements[10] = b20 * a[0] + b21 * a[1] * b22 * a[2];
            this.elements[11] = b20 * a[4] + b21 * a[5] * b22 * a[6];
            this.elements[12] = b20 * a[8] + b21 * a[9] * b22 * a[10];
        }
        /**
         * @param {缩放倍数} k
         * @param {沿着vector缩放} vector 
         */
        scaleTo(k = 1, vector) {
            if (vector instanceof Vector3) {
                throw new Error('param 2 must be Vector3');
            }
            let normalizeVec = vector.normalize();
            //如果向量为0向量
            if (normalizeVec.isZero()) {
                return;
            }
            this.identity();
            let {
                x,
                y,
                z
            } = normalizeVec;
            this.elements[0] = 1 + (k - 1) * x * x;
            this.elements[4] = (k - 1) * x * y;
            this.elements[8] = (k - 1) * x * z;

            this.elements[1] = (k - 1) * x * y;
            this.elements[5] = 1 + (k - 1) * y * y;
            this.elements[9] = (k - 1) * y * z;

            this.elements[2] = (k - 1) * x * z;
            this.elements[6] = (k - 1) * y * z;
            this.elements[10] = 1 + (k - 1) * z * z;
        }
        scale(k = 1, vector) {
            if (vector instanceof Vector3) {
                throw new Error('param 2 must be Vector3');
            }
            let normalizeVec = vector.normalize();
            //如果向量为0向量
            if (normalizeVec.isZero()) {
                return;
            }
            let {
                x,
                y,
                z
            } = normalizeVec;
            let a = this.clone();
            let b00 = 1 + (k - 1) * x * x,
                b01 = (k - 1) * x * y,
                b02 = (k - 1) * x * z;
            let b10 = (k - 1) * x * y,
                b11 = 1 + (k - 1) * y * y,
                b12 = (k - 1) * y * z;
            let b20 = (k - 1) * x * z,
                b21 = (k - 1) * y * z,
                b22 = 1 + (k - 1) * z * z;

            this.elements[0] = b00 * a.elements[0] + b01 * a.elements[1] + b02 * a.elements[2];
            this.elements[4] = b00 * a.elements[4] + b01 * a.elements[5] + b02 * a.elements[6];
            this.elements[8] = b00 * a.elements[8] + b01 * a.elements[9] + b02 * a.elements[10];

            this.elements[1] = b10 * a.elements[0] + b11 * a.elements[1] + b12 * a.elements[2];
            this.elements[5] = b10 * a.elements[4] + b11 * a.elements[5] + b12 * a.elements[6];
            this.elements[9] = b10 * a.elements[8] + b11 * a.elements[9] + b12 * a.elements[10];

            this.elements[2] = b20 * a.elements[0] + b21 * a.elements[1] + b22 * a.elements[2];
            this.elements[6] = b20 * a.elements[4] + b21 * a.elements[5] + b22 * a.elements[6];
            this.elements[10] = b20 * a.elements[8] + b21 * a.elements[9] + b22 * a.elements[10];
        }
        //斜切
        /**
         * @param {x被y改变的部分} s 
         * @param {x被z改变的部分} t 
         */
        skewXTo(s, t) {
            this.identity();
            this.elements[4] = s;
            this.elements[8] = t;
        }
        /**
         * @param {y被x改变的部分} s 
         * @param {z被z改变的部分} t 
         */
        skewYTo(s, t) {
            this.identity();
            this.elements[1] = s;
            this.elements[9] = t;
        }
        /**
         * @param {z被x改变的部分} s 
         * @param {z被y改变的部分} t 
         */
        skewZTo(s, t) {
            this.identity();
            this.elements[2] = s;
            this.elements[6] = t;
        }
        skewX(s, t) {
            let a = this.clone();
            let b00 = 1,
                b01 = s,
                b02 = t;
            let b10 = 0,
                b11 = 1,
                b12 = 0;
            let b20 = 0,
                b21 = 0,
                b22 = 1;

            this.elements[0] = b00 * a.elements[0] + b01 * a.elements[1] + b02 * a.elements[2];
            this.elements[4] = b00 * a.elements[4] + b01 * a.elements[5] + b02 * a.elements[6];
            this.elements[8] = b00 * a.elements[8] + b01 * a.elements[9] + b02 * a.elements[10];

            this.elements[1] = b10 * a.elements[0] + b11 * a.elements[1] + b12 * a.elements[2];
            this.elements[5] = b10 * a.elements[4] + b11 * a.elements[5] + b12 * a.elements[6];
            this.elements[9] = b10 * a.elements[8] + b11 * a.elements[9] + b12 * a.elements[10];

            this.elements[2] = b20 * a.elements[0] + b21 * a.elements[1] + b22 * a.elements[2];
            this.elements[6] = b20 * a.elements[4] + b21 * a.elements[5] + b22 * a.elements[6];
            this.elements[10] = b20 * a.elements[8] + b21 * a.elements[9] + b22 * a.elements[10];

        }
        skewY(s, t) {
            let a = this.clone();
            let b00 = 1,
                b01 = 0,
                b02 = 0;
            let b10 = s,
                b11 = 1,
                b12 = t;
            let b20 = 0,
                b21 = 0,
                b22 = 1;

            this.elements[0] = b00 * a.elements[0] + b01 * a.elements[1] + b02 * a.elements[2];
            this.elements[4] = b00 * a.elements[4] + b01 * a.elements[5] + b02 * a.elements[6];
            this.elements[8] = b00 * a.elements[8] + b01 * a.elements[9] + b02 * a.elements[10];

            this.elements[1] = b10 * a.elements[0] + b11 * a.elements[1] + b12 * a.elements[2];
            this.elements[5] = b10 * a.elements[4] + b11 * a.elements[5] + b12 * a.elements[6];
            this.elements[9] = b10 * a.elements[8] + b11 * a.elements[9] + b12 * a.elements[10];

            this.elements[2] = b20 * a.elements[0] + b21 * a.elements[1] + b22 * a.elements[2];
            this.elements[6] = b20 * a.elements[4] + b21 * a.elements[5] + b22 * a.elements[6];
            this.elements[10] = b20 * a.elements[8] + b21 * a.elements[9] + b22 * a.elements[10];
        }
        skewZ(s, t) {
            let a = this.clone();
            let b00 = 1,
                b01 = 0,
                b02 = 0;
            let b10 = 0,
                b11 = 1,
                b12 = 0;
            let b20 = s,
                b21 = t,
                b22 = 1;

            this.elements[0] = b00 * a.elements[0] + b01 * a.elements[1] + b02 * a.elements[2];
            this.elements[4] = b00 * a.elements[4] + b01 * a.elements[5] + b02 * a.elements[6];
            this.elements[8] = b00 * a.elements[8] + b01 * a.elements[9] + b02 * a.elements[10];

            this.elements[1] = b10 * a.elements[0] + b11 * a.elements[1] + b12 * a.elements[2];
            this.elements[5] = b10 * a.elements[4] + b11 * a.elements[5] + b12 * a.elements[6];
            this.elements[9] = b10 * a.elements[8] + b11 * a.elements[9] + b12 * a.elements[10];

            this.elements[2] = b20 * a.elements[0] + b21 * a.elements[1] + b22 * a.elements[2];
            this.elements[6] = b20 * a.elements[4] + b21 * a.elements[5] + b22 * a.elements[6];
            this.elements[10] = b20 * a.elements[8] + b21 * a.elements[9] + b22 * a.elements[10];
        }
        //镜像
        reflectTo(vector) {
            if (vector instanceof Vector3) {
                throw new Error('param 2 must be Vector3');
            }
            let n = vector.normalize();
            this.elements[0] = 1 - 2 * n.x * n.x;
            this.elements[4] = -2 * n.x * n.y;
            this.elements[8] = -2 * n.x * n.z;

            this.elements[1] = -2 * n.x * n.y;
            this.elements[5] = 1 - 2 * n.y * n.y;
            this.elements[9] = -2 * n.y * n.z;

            this.elements[2] = -2 * n.x * n.z;
            this.elements[6] = -2 * n.y * n.z;
            this.elements[10] = 1 - 2 * n.z * n.z;
        }
        reflect(vector) {
            if (vector instanceof Vector3) {
                throw new Error('param 2 must be Vector3');
            }
            let n = vector.normalize();
            let a = this.clone();
            let b00 = 1 - 2 * n.x * n.x,
                b01 = -2 * n.x * n.y,
                b02 = -2 * n.x * n.z;
            let b10 = -2 * n.x * n.y,
                b11 = 1 - 2 * n.y * n.y,
                b12 = -2 * n.y * n.z;
            let b20 = -2 * n.x * n.z,
                b21 = -2 * n.y * n.z,
                b22 = 1 - 2 * n.z * n.z;

            this.elements[0] = b00 * a.elements[0] + b01 * a.elements[1] + b02 * a.elements[2];
            this.elements[4] = b00 * a.elements[4] + b01 * a.elements[5] + b02 * a.elements[6];
            this.elements[8] = b00 * a.elements[8] + b01 * a.elements[9] + b02 * a.elements[10];

            this.elements[1] = b10 * a.elements[0] + b11 * a.elements[1] + b12 * a.elements[2];
            this.elements[5] = b10 * a.elements[4] + b11 * a.elements[5] + b12 * a.elements[6];
            this.elements[9] = b10 * a.elements[8] + b11 * a.elements[9] + b12 * a.elements[10];

            this.elements[2] = b20 * a.elements[0] + b21 * a.elements[1] + b22 * a.elements[2];
            this.elements[6] = b20 * a.elements[4] + b21 * a.elements[5] + b22 * a.elements[6];
            this.elements[10] = b20 * a.elements[8] + b21 * a.elements[9] + b22 * a.elements[10];
        }
        //投影
        projectionTo() {
            if (vector instanceof Vector3) {
                throw new Error('param 2 must be Vector3');
            }
            let n = vector.normalize();
            this.elements[0] = 1 - n.x * n.x;
            this.elements[4] = -n.x * n.y;
            this.elements[8] = -n.x * n.z;

            this.elements[1] = -n.x * n.y;
            this.elements[5] = 1 - n.y * n.y;
            this.elements[9] = -n.y * n.z;

            this.elements[2] = -n.x * n.z;
            this.elements[6] = -n.y * n.z;
            this.elements[10] = 1 - n.z * n.z;
        }
        projection() {
            if (vector instanceof Vector3) {
                throw new Error('param 2 must be Vector3');
            }
            let n = vector.normalize();
            let a = this.clone();
            let b00 = 1 - n.x * n.x,
                b01 = -n.x * n.y,
                b02 = -n.x * n.z;
            let b10 = -n.x * n.y,
                b11 = 1 - n.y * n.y,
                b12 = -n.y * n.z;
            let b20 = -n.x * n.z,
                b21 = -n.y * n.z,
                b22 = 1 - n.z * n.z;

            this.elements[0] = b00 * a.elements[0] + b01 * a.elements[1] + b02 * a.elements[2];
            this.elements[4] = b00 * a.elements[4] + b01 * a.elements[5] + b02 * a.elements[6];
            this.elements[8] = b00 * a.elements[8] + b01 * a.elements[9] + b02 * a.elements[10];

            this.elements[1] = b10 * a.elements[0] + b11 * a.elements[1] + b12 * a.elements[2];
            this.elements[5] = b10 * a.elements[4] + b11 * a.elements[5] + b12 * a.elements[6];
            this.elements[9] = b10 * a.elements[8] + b11 * a.elements[9] + b12 * a.elements[10];

            this.elements[2] = b20 * a.elements[0] + b21 * a.elements[1] + b22 * a.elements[2];
            this.elements[6] = b20 * a.elements[4] + b21 * a.elements[5] + b22 * a.elements[6];
            this.elements[10] = b20 * a.elements[8] + b21 * a.elements[9] + b22 * a.elements[10];
        }
        perspective() {

        }
    }

    /**
     * @description 向量
     */
    class Vector {
        constructor(n) {
            this.dimension = n;
            this.elements = new Float32Array(n);
            this.elements[0] = 1;
        }
        mod() {
            let square = 0;
            for (let i = 0; i < this.dimension; i++) {
                square += this.elements[i] * this.elements[i]
            }
            return Math.sqrt(square);
        }
        clone() {
            let newVec = new this.constructor(this.dimension);
            return newVec;
        }
        normalize() {
            let mod = this.mod();
            let normalizeVec = new this.constructor(this.dimension);
            for (let i = 0; i < this.elements.length; i++) {
                normalizeVec.elements[i] = this.elements[i] / mod;
            }
            return normalizeVec;
        }
        isZero() {
            for (let i = 0; i < this.elements.length; i++) {
                if (this.elements[i] !== 0) {
                    return false;
                }
            }
            return true;
        }
    }
    /**
     * @description 2维向量
     */
    class Vector2 extends Vector {
        constructor() {
            super(2);
        }
        get x() {
            return this.elements[0];
        }
        set x(value) {
            this.elements[0] = value;
        }
        get y() {
            return this.elements[1];
        }
        set y(value) {
            this.elements[1] = value;
        }
    }
    /**
     * @description 3维向量
     */
    class Vector3 extends Vector {
        constructor() {
            super(3);
        }
        get x() {
            return this.elements[0];
        }
        set x(value) {
            this.elements[0] = value;
        }
        get y() {
            return this.elements[1];
        }
        set y(value) {
            this.elements[1] = value;
        }
        get z() {
            return this.elements[2];
        }
        set z(value) {
            this.elements[2] = value;
        }
    }
    /**
     * @description 4维向量
     */
    class Vector4 extends Vector {
        constructor() {
            super(4);
        }
        get x() {
            return this.elements[0];
        }
        set x(value) {
            this.elements[0] = value;
        }
        get y() {
            return this.elements[1];
        }
        set y(value) {
            this.elements[1] = value;
        }
        get z() {
            return this.elements[2];
        }
        set z(value) {
            this.elements[2] = value;
        }
        get w() {
            return this.elements[3];
        }
        set w(value) {
            this.elements[3] = value;
        }
    }

    /**
     * @description 四元数
     */
    class Quaternion {
        constructor(w = 1, x = 0, y = 0, z = 0) {
            this.w = w;
            this.x = x;
            this.y = y;
            this.z = z;
        }
        //转化为矩阵
        transformToMatrix() {

        }
        //转化为欧拉角
        transformToEuler() {

        }
    }
    /**
     * @descripition 视图矩阵
     * @param {Number} posx x坐标
     * @param {Number} posy y坐标
     * @param {Number} posz 
     * @param {Number} focusx 
     * @param {Number} focusy 
     * @param {Number} focusz 
     * @param {Number} upx 
     * @param {Number} upy 
     * @param {Number} upz 
     */
    function ModelViewMatrix(posx, posy, posz, focusx, focusy, focusz, upx, upy, upz) {
        const matrix = new Matrix4();
        const {
            elements
        } = matrix;
        let len = Math.sqrt((posx - focusx) * (posx - focusx) + (posy - focusy) * (posy - focusy) + (posz - focusz) * (posz - focusz));
        if (len !== 0) {
            elements[2] = (posx - focusx) / len;
            elements[6] = (posy - focusy) / len;
            elements[10] = (posz - focusz) / len;
        }
        //根据新的z轴与up求出x轴坐标
        let upLen = Math.sqrt(upx * upx + upy * upy + upz * upz);
        upx = (upLen === 0 ? 0 : upx / upLen);
        upy = (upLen === 0 ? 0 : upy / upLen);
        upz = (upLen === 0 ? 0 : upz / upLen);
        elements[0] = upy * elements[10] - upz * elements[6];
        elements[4] = upz * elements[2] - upx * elements[10];
        elements[8] = upx * elements[6] - upy * elements[2];
        //根据新的x轴坐标求出y轴坐标
        elements[1] = elements[6] * elements[8] - elements[10] * elements[4];
        elements[5] = elements[10] * elements[0] - elements[2] * elements[8];
        elements[9] = elements[2] * elements[4] - elements[6] * elements[0];

        elements[12] = -posx;
        elements[13] = -posy;
        elements[14] = -posz;

        return matrix;
    }
    /**
     * @description 投影矩阵
     * @param {Number} fieldOfView 
     * @param {Number} zNear 
     * @param {Number} zFar 
     */
    function ProjectionMatrix(fieldOfView, zNear, zFar) {
        const matrix = new Matrix4();
        var cot = 1 / Math.tan(fieldOfView / 2);
        matrix.elements[0] = cot / asp;
        matrix.elements[5] = cot;
        matrix.elements[10] = -(zNear + zFar) / (zFar - zNear);
        matrix.elements[11] = -1;
        matrix.elements[14] = -2 * zFar * zNear / (zFar - zNear);
        return matrix;
    }
    /**
     * @description 投影矩阵的另一种定义方法
     * @param {*} left 
     * @param {*} right 
     * @param {*} top 
     * @param {*} bottom 
     * @param {*} zNear 
     * @param {*} zFar 
     */
    function ProjectionMatrix2(left, right, top, bottom, zNear, zFar) {
        const matrix = new Matrix4();
        const { elements } = matrix;
        elements[0] = 2 * zNear / (right - left);
        elements[8] = (right + left) / (right - left);
        elements[5] = 2 * zNear / (top - bottom);
        elements[11] = (top + bottom) / (top - bottom);
        elements[12] = -(f + n) / (f - n);
        elements[14] = 2 * f * n / (f - n);
        return matrix;
    }
    if (!global.mm3d) {
        global.mm3d = {};
        mm3d.ModelViewMatrix = ModelViewMatrix;
        mm3d.ProjectionMatrix = ProjectionMatrix;
    }
})(this);
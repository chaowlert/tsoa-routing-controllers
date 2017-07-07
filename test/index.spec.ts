import * as plugin from '../src/index';
import * as ts from 'typescript';

import { expect } from 'chai';

describe('routingControllerDecoratorPlugin', () => {
    it('should get routing prefix from Controller call', () => {
        let expr = getCallExpression(`Controller('test')`);
        let result = plugin.getRoutePrefix(expr);
        expect(result).equals('test');
    });
    it('should return empty from Controller call with no arg', () => {
        let expr = getCallExpression(`Controller()`);
        let result = plugin.getRoutePrefix(expr);
        expect(result).equals('');
    });
    it('should resolve method from Get', () => {
        let expr = getCallExpression(`Get()`);
        let result = plugin.getMethodAction(expr);
        expect(result.method).equals('get');
        expect(result.path).equals('');
    });
    it('should resolve method from Post', () => {
        let expr = getCallExpression(`Post()`);
        let result = plugin.getMethodAction(expr);
        expect(result.method).equals('post');
        expect(result.path).equals('');
    });
    it('should resolve method from Get with path', () => {
        let expr = getCallExpression(`Get('/:id')`);
        let result = plugin.getMethodAction(expr);
        expect(result.method).equals('get');
        expect(result.path).equals('/{id}');
    });
    it('should resolve method from Method with path', () => {
        let expr = getCallExpression(`Method('Option', '/xxx/:id/:sub')`);
        let result = plugin.getMethodAction(expr);
        expect(result.method).equals('option');
        expect(result.path).equals('/xxx/{id}/{sub}');
    });
    it('should resolve response from HttpCode', () => {
        let expr = getCallExpression(`HttpCode(200)`);
        let type = { typeName: 'void' };
        let result = plugin.getMethodResponse(expr, type);
        expect(result.code).equals(200);
        expect(result.schema).equals(type);
    });
    it('should resolve response from Redirect', () => {
        let expr = getCallExpression(`Redirect('http://google.com')`);
        let type = { typeName: 'void' };
        let result = plugin.getMethodResponse(expr, type);
        expect(result.code).equals(302);
        expect(result.schema).is.undefined;
    });
    it('should return permission from Authorize', () => {
        let expr = getCallExpression(`Authorize('admin')`);
        let result = plugin.getMethodSecurities(expr);
        expect(result.name).equals('admin');
    });
    it('should return permission from Authorize with multiple roles', () => {
        let expr = getCallExpression(`Authorize(['role1', 'role2'])`);
        let result = plugin.getMethodSecurities(expr);
        expect(result.name).equals('role1, role2');
    });
    it('should resolve ContentType', () => {
        let expr = getCallExpression(`ContentType('text/csv')`);
        let result = plugin.getProduce(expr);
        expect(result).equals('text/csv');
    });
});

function getCallExpression(source: string) {
    let script = ts.createSourceFile('temp', source, ts.ScriptTarget.Latest);
    let expr = script.statements[0] as ts.ExpressionStatement;
    return expr.expression as ts.CallExpression;
}
